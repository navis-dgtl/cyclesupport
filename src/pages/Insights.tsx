import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cyclePhases, CyclePhase } from "@/lib/cycleData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Calendar, TrendingUp, Clock } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";

interface CycleEntry {
  entry_date: string;
  phase: CyclePhase;
  notes: string | null;
}

interface CycleStats {
  averageCycleLength: number;
  totalCycles: number;
  phaseDurations: { phase: string; days: number; color: string }[];
  monthlyData: { month: string; entries: number }[];
}

const Insights = () => {
  const [stats, setStats] = useState<CycleStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: entries, error } = await supabase
        .from('cycle_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: true });

      if (error) throw error;

      if (entries && entries.length > 0) {
        const typedEntries = entries as CycleEntry[];
        
        // Calculate cycle statistics
        const menstrualStarts = typedEntries.filter(e => e.phase === 'menstrual');
        let totalCycleLength = 0;
        let cycleCount = 0;

        for (let i = 0; i < menstrualStarts.length - 1; i++) {
          const cycleLength = differenceInDays(
            parseISO(menstrualStarts[i + 1].entry_date),
            parseISO(menstrualStarts[i].entry_date)
          );
          totalCycleLength += cycleLength;
          cycleCount++;
        }

        const averageCycleLength = cycleCount > 0 ? Math.round(totalCycleLength / cycleCount) : 28;

        // Calculate phase durations
        const phaseCounts: Record<CyclePhase, number> = {
          menstrual: 0,
          follicular: 0,
          ovulatory: 0,
          luteal: 0
        };

        typedEntries.forEach(entry => {
          phaseCounts[entry.phase]++;
        });

        const phaseDurations = Object.entries(phaseCounts).map(([phase, count]) => ({
          phase: cyclePhases[phase as CyclePhase].name,
          days: count,
          color: `hsl(var(--${cyclePhases[phase as CyclePhase].color}))`
        }));

        // Calculate monthly data for the last 6 months
        const monthlyData: { month: string; entries: number }[] = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = format(monthDate, 'MMM yyyy');
          const entriesInMonth = typedEntries.filter(entry => {
            const entryDate = parseISO(entry.entry_date);
            return entryDate.getMonth() === monthDate.getMonth() && 
                   entryDate.getFullYear() === monthDate.getFullYear();
          }).length;
          
          monthlyData.push({ month: monthKey, entries: entriesInMonth });
        }

        setStats({
          averageCycleLength,
          totalCycles: cycleCount,
          phaseDurations,
          monthlyData
        });
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading insights...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Not Enough Data Yet</CardTitle>
              <CardDescription>
                Start tracking cycle entries to see insights and patterns
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-foreground">Cycle Insights</h1>
          <p className="text-muted-foreground">Patterns and trends over time</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Cycle</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averageCycleLength} days</div>
              <p className="text-xs text-muted-foreground mt-1">Based on tracked cycles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cycles Tracked</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCycles}</div>
              <p className="text-xs text-muted-foreground mt-1">Complete cycles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tracking Days</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.phaseDurations.reduce((sum, p) => sum + p.days, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Days logged</p>
            </CardContent>
          </Card>
        </div>

        {/* Tracking Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Tracking Activity (Last 6 Months)</CardTitle>
            <CardDescription>Number of entries logged each month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="entries" 
                  fill="hsl(var(--primary))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Phase Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phase Distribution</CardTitle>
            <CardDescription>Time spent in each phase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.phaseDurations}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ phase, days }) => `${phase}: ${days}d`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="days"
                  >
                    {stats.phaseDurations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-col justify-center space-y-4">
                {stats.phaseDurations.map((phase, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-4 w-4 rounded-full" 
                        style={{ backgroundColor: phase.color }}
                      />
                      <span className="text-sm font-medium">{phase.phase}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{phase.days} days</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights Card */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Pattern Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <p className="text-sm text-foreground">
                Your tracking shows an average cycle of {stats.averageCycleLength} days, which is {stats.averageCycleLength === 28 ? 'exactly typical' : stats.averageCycleLength > 28 ? 'slightly longer than typical' : 'slightly shorter than typical'}.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <p className="text-sm text-foreground">
                Continue tracking to discover more personalized patterns and insights about what works best during each phase.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Insights;
