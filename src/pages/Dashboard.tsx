import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cyclePhases, CyclePhase } from "@/lib/cycleData";
import { Calendar, Heart, MessageSquare, Flower, ArrowRight, Moon, Sprout, Sun, Flower2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format, differenceInDays, parseISO } from "date-fns";

interface CycleEntry {
  entry_date: string;
  phase: CyclePhase;
  notes: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState<CyclePhase | null>(null);
  const [cycleDay, setCycleDay] = useState<number | null>(null);
  const [daysUntilNextPhase, setDaysUntilNextPhase] = useState<number | null>(null);
  const [supportTips, setSupportTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentCycleInfo();
  }, []);

  const fetchCurrentCycleInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all cycle entries sorted by date
      const { data: entries, error } = await supabase
        .from('cycle_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;

      if (entries && entries.length > 0) {
        const mostRecent = entries[0] as CycleEntry;
        setCurrentPhase(mostRecent.phase);

        // Find the most recent menstrual phase start
        const menstrualStart = entries.find(e => e.phase === 'menstrual');
        if (menstrualStart) {
          const daysSinceMenstrual = differenceInDays(new Date(), parseISO(menstrualStart.entry_date)) + 1;
          setCycleDay(daysSinceMenstrual);
        }

        // Calculate days until next phase (rough estimate based on typical cycle)
        const phaseOrder: CyclePhase[] = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
        const currentIndex = phaseOrder.indexOf(mostRecent.phase);
        const nextPhase = phaseOrder[(currentIndex + 1) % 4];
        
        // Rough estimates for phase durations
        const phaseDurations = { menstrual: 5, follicular: 8, ovulatory: 3, luteal: 12 };
        const daysSinceLastEntry = differenceInDays(new Date(), parseISO(mostRecent.entry_date));
        const estimatedDaysLeft = Math.max(1, phaseDurations[mostRecent.phase] - daysSinceLastEntry);
        setDaysUntilNextPhase(estimatedDaysLeft);

        // Set contextual support tips
        const phaseInfo = cyclePhases[mostRecent.phase];
        setSupportTips(phaseInfo.supportTips.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching cycle info:', error);
      toast.error('Failed to load cycle information');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: MessageSquare,
      label: "Ask AI Assistant",
      action: () => navigate('/assistant'),
      color: "primary"
    },
    {
      icon: Heart,
      label: "Send Support",
      action: () => {
        if (currentPhase) {
          navigate(`/assistant?autoMessage=support&phase=${currentPhase}`);
        } else {
          toast.error("No current phase data available");
        }
      },
      color: "secondary"
    },
    {
      icon: Calendar,
      label: "Log Today",
      action: () => navigate('/calendar'),
      color: "secondary"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  if (!currentPhase) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Your Dashboard</CardTitle>
              <CardDescription>Get started by logging your first cycle entry</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/calendar')}>
                Go to Calendar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const phaseInfo = cyclePhases[currentPhase];
  
  // Map icon names to actual icon components
  const iconMap = {
    Moon,
    Sprout,
    Sun,
    Flower2
  };
  const PhaseIcon = iconMap[phaseInfo.iconName as keyof typeof iconMap];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Today's Overview</h1>
          <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>

        {/* Current Phase Card */}
        <Card className="border-2" style={{ borderColor: `hsl(var(--${phaseInfo.color}))` }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: `hsl(var(--${phaseInfo.lightColor}))` }}
              >
                <PhaseIcon className="h-6 w-6" style={{ color: `hsl(var(--${phaseInfo.color}))` }} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{phaseInfo.name}</CardTitle>
                <CardDescription>
                  {cycleDay && `Cycle Day ${cycleDay}`} • {phaseInfo.days}
                </CardDescription>
              </div>
              {daysUntilNextPhase && (
                <div className="text-center px-4 py-2 rounded-lg bg-secondary">
                  <p className="text-2xl font-bold text-foreground">{daysUntilNextPhase}</p>
                  <p className="text-xs text-muted-foreground">days until next phase</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">What's happening</h3>
              <p className="text-sm text-muted-foreground">{phaseInfo.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Support Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Support Tips</CardTitle>
            <CardDescription>Ways you can be there for her right now</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {supportTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <p className="text-sm text-foreground">{tip}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.color === "primary" ? "default" : "outline"}
                    className="h-auto py-6 flex flex-col gap-2"
                    onClick={action.action}
                  >
                    <Icon className="h-6 w-6" />
                    <span>{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Phase Guide Link */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Want to learn more?</h3>
                <p className="text-sm text-muted-foreground">Explore all phases in detail</p>
              </div>
              <Button variant="ghost" onClick={() => navigate('/phases')}>
                View Guide <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
