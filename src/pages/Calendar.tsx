import { useState, useEffect } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cyclePhases, CyclePhase } from "@/lib/cycleData";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedPhase, setSelectedPhase] = useState<CyclePhase>('menstrual');
  const [cycleEntries, setCycleEntries] = useState<Record<string, CyclePhase>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCycleEntries();
  }, []);

  const fetchCycleEntries = async () => {
    const { data, error } = await supabase
      .from('cycle_entries')
      .select('*')
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Error fetching cycle entries:', error);
      return;
    }

    const entriesMap: Record<string, CyclePhase> = {};
    data?.forEach((entry) => {
      entriesMap[entry.entry_date] = entry.phase as CyclePhase;
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

    const dateStr = format(date, 'yyyy-MM-dd');
    
    const { error } = await supabase
      .from('cycle_entries')
      .upsert({
        entry_date: dateStr,
        phase: selectedPhase,
      }, {
        onConflict: 'entry_date'
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

  const getPhaseForDate = (date: Date): CyclePhase | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return cycleEntries[dateStr];
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
                    menstrual: "bg-menstrual-light border-menstrual",
                    follicular: "bg-follicular-light border-follicular",
                    ovulatory: "bg-ovulatory-light border-ovulatory",
                    luteal: "bg-luteal-light border-luteal",
                  }}
                />
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Log Phase</h3>
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
                        {Object.entries(cyclePhases).map(([key, phase]) => (
                          <SelectItem key={key} value={key}>
                            {phase.icon} {phase.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleSaveEntry} className="w-full">
                    Save Entry
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Legend</h4>
                <div className="space-y-2">
                  {Object.entries(cyclePhases).map(([key, phase]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded bg-${phase.lightColor} border border-${phase.color}`} />
                      <span className="text-sm">
                        {phase.icon} {phase.name}
                      </span>
                    </div>
                  ))}
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