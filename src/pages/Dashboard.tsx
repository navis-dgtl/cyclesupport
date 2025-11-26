import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cyclePhases, CyclePhase } from "@/lib/cycleData";
import { Calendar, MessageSquare, ArrowRight, Moon, Sprout, Sun, Flower2, Droplet, BookOpen, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format, differenceInDays, parseISO, addDays } from "date-fns";
import { PeriodStartedDialog } from "@/components/PeriodStartedDialog";
import { QuickMessageDropdown } from "@/components/QuickMessageDropdown";

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
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  const [averageCycleLength, setAverageCycleLength] = useState(28);
  const [loveLanguage, setLoveLanguage] = useState<string>("");
  const [partnerName, setPartnerName] = useState<string>("");
  const [dietaryPreferences, setDietaryPreferences] = useState<string>("");
  const [favoriteActivities, setFavoriteActivities] = useState<string>("");
  const [daysUntilNextPeriod, setDaysUntilNextPeriod] = useState<number | null>(null);
  const [nextPeriodDate, setNextPeriodDate] = useState<Date | null>(null);
  const [periodConfidence, setPeriodConfidence] = useState<'high' | 'medium' | 'low'>('low');
  const [trackedCycles, setTrackedCycles] = useState(0);

  useEffect(() => {
    fetchCurrentCycleInfo();
  }, []);

  const findPeriodStarts = (entries: CycleEntry[]): string[] => {
    const periodStarts: string[] = [];
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    );

    for (let i = 0; i < sortedEntries.length; i++) {
      const current = sortedEntries[i];
      if (current.phase === 'menstrual') {
        const prev = i > 0 ? sortedEntries[i - 1] : null;
        if (!prev || prev.phase !== 'menstrual' || 
            differenceInDays(parseISO(current.entry_date), parseISO(prev.entry_date)) > 1) {
          periodStarts.push(current.entry_date);
        }
      }
    }

    return periodStarts;
  };

  const fetchCurrentCycleInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setAverageCycleLength(profile.average_cycle_length || 28);
        setLoveLanguage(profile.love_language || "");
        setPartnerName(profile.partner_name || "");
        setDietaryPreferences(profile.dietary_preferences || "");
        setFavoriteActivities(profile.favorite_activities || "");
      }

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

        // Find period starts and calculate prediction
        const periodStarts = findPeriodStarts(entries);
        setTrackedCycles(periodStarts.length);

        if (periodStarts.length > 0) {
          const lastPeriodStart = parseISO(periodStarts[periodStarts.length - 1]);
          const cycleLength = profile?.average_cycle_length || 28;
          const predictedNextPeriod = addDays(lastPeriodStart, cycleLength);
          const today = new Date();
          const daysUntil = differenceInDays(predictedNextPeriod, today);

          setNextPeriodDate(predictedNextPeriod);
          setDaysUntilNextPeriod(daysUntil);

          // Set confidence based on tracking history
          if (periodStarts.length >= 3) {
            setPeriodConfidence('high');
          } else if (periodStarts.length === 2) {
            setPeriodConfidence('medium');
          } else {
            setPeriodConfidence('low');
          }

          // Calculate cycle day
          const daysSincePeriod = differenceInDays(today, lastPeriodStart) + 1;
          setCycleDay(daysSincePeriod);
        }

        // Calculate days until next phase
        const phaseOrder: CyclePhase[] = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
        const currentIndex = phaseOrder.indexOf(mostRecent.phase);
        const phaseDurations = { menstrual: 5, follicular: 8, ovulatory: 3, luteal: 12 };
        const daysSinceLastEntry = differenceInDays(new Date(), parseISO(mostRecent.entry_date));
        const estimatedDaysLeft = Math.max(1, phaseDurations[mostRecent.phase] - daysSinceLastEntry);
        setDaysUntilNextPhase(estimatedDaysLeft);

        // Set personalized support tips
        const phaseInfo = cyclePhases[mostRecent.phase];
        if (loveLanguage && phaseInfo.loveLanguageTips) {
          const loveLanguageKey = loveLanguage as keyof typeof phaseInfo.loveLanguageTips;
          const personalizedTips = phaseInfo.loveLanguageTips[loveLanguageKey] || [];
          
          // Shuffle and pick 2 personalized + 1 general
          const shuffledPersonalized = [...personalizedTips].sort(() => Math.random() - 0.5);
          const shuffledGeneral = [...phaseInfo.supportTips].sort(() => Math.random() - 0.5);
          setSupportTips([...shuffledPersonalized.slice(0, 2), shuffledGeneral[0]]);
        } else {
          // No love language set, show 3 general tips
          const shuffled = [...phaseInfo.supportTips].sort(() => Math.random() - 0.5);
          setSupportTips(shuffled.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error fetching cycle info:', error);
      toast.error('Failed to load cycle information');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageTypeSelect = async (type: string, title: string, prompt: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create new conversation with specific title
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({ 
        title,
        user_id: user.id 
      })
      .select()
      .single();

    if (error || !newConv) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return;
    }

    // Navigate with the conversation ID and auto-send the message
    navigate(`/assistant?conversationId=${newConv.id}&autoMessage=${type}&prompt=${encodeURIComponent(prompt)}`);
  };

  const quickActions = [
    {
      icon: MessageSquare,
      label: "Ask AI Assistant",
      action: () => navigate('/assistant'),
      color: "primary"
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
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Welcome to Your Dashboard</h1>
            <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>

          {/* Period Started Card - Prominent for first-time users */}
          <Card className="border-2 bg-menstrual-light/20" style={{ borderColor: 'hsl(var(--menstrual))' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full" style={{ backgroundColor: 'hsl(var(--menstrual-light))' }}>
                  <Droplet className="h-6 w-6" style={{ color: 'hsl(var(--menstrual))' }} />
                </div>
                <div className="flex-1">
                  <CardTitle>Period Started?</CardTitle>
                  <CardDescription>Quick-log a new cycle with predicted phases</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setPeriodDialogOpen(true)}
                className="w-full"
                size="lg"
              >
                Log Period Start
              </Button>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                This will automatically create entries for your entire cycle
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Start tracking to get personalized insights</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/calendar')}>
                Go to Calendar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <PeriodStartedDialog
          open={periodDialogOpen}
          onOpenChange={setPeriodDialogOpen}
          averageCycleLength={averageCycleLength}
          onSuccess={fetchCurrentCycleInfo}
        />
      </div>
    );
  }

  const phaseInfo = cyclePhases[currentPhase];
  
  const iconMap = {
    Moon,
    Sprout,
    Sun,
    Flower2
  };
  const PhaseIcon = iconMap[phaseInfo.iconName as keyof typeof iconMap];

  // Period countdown visual states
  const getPeriodCountdownState = () => {
    if (daysUntilNextPeriod === null) return 'none';
    if (daysUntilNextPeriod < 0) return 'overdue';
    if (daysUntilNextPeriod === 0) return 'today';
    if (daysUntilNextPeriod <= 3) return 'imminent';
    if (daysUntilNextPeriod <= 7) return 'approaching';
    return 'normal';
  };

  const periodState = getPeriodCountdownState();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Today's Overview</h1>
          <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>

        {/* Period Started Card */}
        <Card className="border-2 bg-menstrual-light/20" style={{ borderColor: 'hsl(var(--menstrual))' }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full" style={{ backgroundColor: 'hsl(var(--menstrual-light))' }}>
                <Droplet className="h-6 w-6" style={{ color: 'hsl(var(--menstrual))' }} />
              </div>
              <div className="flex-1">
                <CardTitle>Period Started?</CardTitle>
                <CardDescription>Quick-log a new cycle</CardDescription>
              </div>
              <Button onClick={() => setPeriodDialogOpen(true)} size="lg">
                Log Period Start
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Period Prediction Countdown */}
        {daysUntilNextPeriod !== null && periodState !== 'none' && (
          <Card 
            className={`border-2 ${
              periodState === 'overdue' ? 'bg-amber-50 dark:bg-amber-950/20' :
              periodState === 'today' ? 'bg-menstrual-light/30' :
              periodState === 'imminent' ? 'bg-menstrual-light/20' :
              periodState === 'approaching' ? 'bg-amber-50 dark:bg-amber-950/10' :
              'bg-muted/30'
            }`}
            style={{ 
              borderColor: periodState === 'overdue' || periodState === 'approaching' 
                ? 'hsl(var(--amber))' 
                : periodState === 'today' || periodState === 'imminent'
                ? 'hsl(var(--menstrual))'
                : 'hsl(var(--border))'
            }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {periodState === 'overdue' ? `Period is ${Math.abs(daysUntilNextPeriod)} days late` :
                     periodState === 'today' ? 'Period expected today' :
                     `Period expected in ${daysUntilNextPeriod} days`}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {nextPeriodDate && format(nextPeriodDate, 'EEEE, MMMM d')}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground mt-2">
                    {periodConfidence === 'high' && `Based on ${trackedCycles} tracked cycles`}
                    {periodConfidence === 'medium' && `Based on ${trackedCycles} tracked cycles`}
                    {periodConfidence === 'low' && 'Based on average cycle length'}
                  </p>
                </div>
                <div className="text-center">
                  <div 
                    className={`text-4xl font-bold ${
                      periodState === 'overdue' || periodState === 'approaching' ? 'text-amber-600 dark:text-amber-400' :
                      periodState === 'today' || periodState === 'imminent' ? 'text-[hsl(var(--menstrual))]' :
                      'text-foreground'
                    }`}
                  >
                    {daysUntilNextPeriod >= 0 ? daysUntilNextPeriod : Math.abs(daysUntilNextPeriod)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {periodState === 'overdue' ? 'days late' : 'days'}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

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
                    {loveLanguage && index < 2 ? (
                      <Sparkles className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{tip}</p>
                    {loveLanguage && index < 2 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on her love language: {
                          loveLanguage === 'words' ? 'Words of Affirmation' :
                          loveLanguage === 'acts' ? 'Acts of Service' :
                          loveLanguage === 'gifts' ? 'Receiving Gifts' :
                          loveLanguage === 'time' ? 'Quality Time' :
                          'Physical Touch'
                        }
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {!loveLanguage && (
              <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground">
                  💡 Add her love language in your Profile for personalized tips
                </p>
              </div>
            )}
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
              
              {/* Quick Message Dropdown */}
              <div className="md:col-span-1">
                <QuickMessageDropdown
                  onSelectMessageType={handleMessageTypeSelect}
                  currentPhase={phaseInfo.name}
                  partnerName={partnerName}
                  dietaryPreferences={dietaryPreferences}
                  favoriteActivities={favoriteActivities}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase Guide Link - Enhanced */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-2" style={{ borderColor: 'hsl(var(--primary) / 0.3)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Phase Guide</h3>
                  <p className="text-sm text-muted-foreground">Learn about all phases, foods, and support tips</p>
                </div>
              </div>
              <Button variant="default" onClick={() => navigate('/phases')}>
                View Guide <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <PeriodStartedDialog
        open={periodDialogOpen}
        onOpenChange={setPeriodDialogOpen}
        averageCycleLength={averageCycleLength}
        onSuccess={fetchCurrentCycleInfo}
      />
    </div>
  );
};

export default Dashboard;
