import { useState, useEffect } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cyclePhases, CyclePhase } from "@/lib/cycleData";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedPhase, setSelectedPhase] = useState<CyclePhase>('menstrual');
  const [notes, setNotes] = useState('');
  const [cycleEntries, setCycleEntries] = useState<Record<string, { phase: CyclePhase; notes: string | null }>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCycleEntries();
  }, []);

  useEffect(() => {
    // Update notes when date changes
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const entry = cycleEntries[dateStr];
      setNotes(entry?.notes || '');
      if (entry?.phase) {
        setSelectedPhase(entry.phase);
      }
    }
  }, [date, cycleEntries]);

  const fetchCycleEntries = async () => {
    const { data, error } = await supabase
      .from('cycle_entries')
      .select('*')
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Error fetching cycle entries:', error);
      return;
    }

    const entriesMap: Record<string, { phase: CyclePhase; notes: string | null }> = {};
    data?.forEach((entry) => {
      entriesMap[entry.entry_date] = {
        phase: entry.phase as CyclePhase,
        notes: entry.notes
      };
    });
    setCycleEntries(entriesMap);
  };

  const handleSaveEntry = async () => {
    if (!date) {
      toast({
        title: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to save entries",
        variant: "destructive",
      });
      return;
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    
    const { error } = await supabase
      .from('cycle_entries')
      .upsert({
        entry_date: dateStr,
        phase: selectedPhase,
        notes: notes.trim() || null,
        user_id: user.id,
      }, {
        onConflict: 'entry_date,user_id'
      });

    if (error) {
      toast({
        title: "Error saving entry",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Entry saved",
      description: `Recorded ${cyclePhases[selectedPhase].name} for ${format(date, 'MMM d, yyyy')}`,
    });

    fetchCycleEntries();
  };

  const handleDeleteEntry = async () => {
    if (!date) {
      toast({
        title: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    
    const { error } = await supabase
      .from('cycle_entries')
      .delete()
      .eq('entry_date', dateStr);

    if (error) {
      toast({
        title: "Error deleting entry",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Entry deleted",
      description: `Removed entry for ${format(date, 'MMM d, yyyy')}`,
    });

    setNotes('');
    fetchCycleEntries();
  };

  const getPhaseForDate = (date: Date): CyclePhase | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return cycleEntries[dateStr]?.phase;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Cycle Calendar</h2>
            <p className="text-muted-foreground">
              Track and view her cycle phases over time
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex justify-center">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                  modifiers={{
                    menstrual: (date) => getPhaseForDate(date) === 'menstrual',
                    follicular: (date) => getPhaseForDate(date) === 'follicular',
                    ovulatory: (date) => getPhaseForDate(date) === 'ovulatory',
                    luteal: (date) => getPhaseForDate(date) === 'luteal',
                  }}
                  modifiersClassNames={{
                    menstrual: "bg-menstrual text-white font-bold border-2 border-menstrual",
                    follicular: "bg-follicular text-white font-bold border-2 border-follicular",
                    ovulatory: "bg-ovulatory text-white font-bold border-2 border-ovulatory",
                    luteal: "bg-luteal text-white font-bold border-2 border-luteal",
                  }}
                />
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Log Phase & Notes</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Selected Date</Label>
                    <div className="text-sm text-muted-foreground">
                      {date ? format(date, 'MMMM d, yyyy') : 'No date selected'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Phase</Label>
                    <Select value={selectedPhase} onValueChange={(value) => setSelectedPhase(value as CyclePhase)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(cyclePhases).map(([key, phase]) => {
                          const IconComponent = Icons[phase.iconName as keyof typeof Icons] as LucideIcon;
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4" />
                                {phase.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Journal Notes (Optional)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What worked well? What support was helpful? Any observations..."
                      className="min-h-[100px]"
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground">
                      {notes.length}/1000 characters • These notes will help the AI assistant provide better advice
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveEntry} className="flex-1">
                      Save Entry
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={handleDeleteEntry}
                      disabled={!date || !cycleEntries[format(date, 'yyyy-MM-dd')]}
                      title="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Legend</h4>
                <div className="space-y-3">
                  {Object.entries(cyclePhases).map(([key, phase]) => {
                    const IconComponent = Icons[phase.iconName as keyof typeof Icons] as LucideIcon;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded font-bold text-white flex items-center justify-center bg-${phase.color} border-2 border-${phase.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">
                          {phase.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;