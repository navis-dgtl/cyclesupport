import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PeriodStartedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  averageCycleLength: number;
  onSuccess: () => void;
}

export const PeriodStartedDialog = ({ open, onOpenChange, averageCycleLength, onSuccess }: PeriodStartedDialogProps) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isCreating, setIsCreating] = useState(false);

  const handleConfirm = async () => {
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = new Date(selectedDate);
      const cycleLength = averageCycleLength || 28;

      // Calculate phase date ranges
      const menstrualEnd = addDays(startDate, 4);
      const follicularEnd = addDays(startDate, 12);
      const ovulatoryEnd = addDays(startDate, 15);
      const lutealEnd = addDays(startDate, cycleLength - 1);

      const entries = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Only create entries up to today
      for (let i = 0; i < cycleLength; i++) {
        const entryDate = addDays(startDate, i);
        if (entryDate > today) break;

        let phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
        let notes = null;

        if (entryDate <= menstrualEnd) {
          phase = 'menstrual';
          if (i === 0) notes = 'Period started';
        } else if (entryDate <= follicularEnd) {
          phase = 'follicular';
        } else if (entryDate <= ovulatoryEnd) {
          phase = 'ovulatory';
        } else {
          phase = 'luteal';
        }

        entries.push({
          user_id: user.id,
          entry_date: format(entryDate, 'yyyy-MM-dd'),
          phase,
          notes
        });
      }

      // Upsert all entries
      const { error } = await supabase
        .from('cycle_entries')
        .upsert(entries, { 
          onConflict: 'user_id,entry_date',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast.success(`Cycle logged! Created ${entries.length} entries from ${format(startDate, 'MMM d')} to ${format(addDays(startDate, entries.length - 1), 'MMM d')}`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error logging period:', error);
      toast.error('Failed to log period start');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Period Start</DialogTitle>
          <DialogDescription>
            This will create cycle entries for a complete cycle based on your average cycle length of {averageCycleLength || 28} days.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Period Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={format(new Date(), "yyyy-MM-dd")}
            />
            <p className="text-xs text-muted-foreground">
              Select a past date or today. Future dates are not allowed.
            </p>
          </div>

          <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
            <p className="text-sm font-medium">Predicted phases:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Menstrual: Days 1-5</li>
              <li>• Follicular: Days 6-13</li>
              <li>• Ovulatory: Days 14-16</li>
              <li>• Luteal: Days 17-{averageCycleLength || 28}</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
