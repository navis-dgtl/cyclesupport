import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, ArrowLeft, Heart } from "lucide-react";
import { addDays, format } from "date-fns";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [partnerName, setPartnerName] = useState("");
  const [lastPeriodStart, setLastPeriodStart] = useState("");
  const [averageCycleLength, setAverageCycleLength] = useState("28");
  const [loveLanguage, setLoveLanguage] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState("");
  const [favoriteActivities, setFavoriteActivities] = useState("");

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSkip = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      navigate("/dashboard");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No user found");
      }

      // Calculate current phase based on last period start
      const periodStart = new Date(lastPeriodStart);
      const today = new Date();
      const daysSinceStart = Math.floor((today.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
      const cycleDay = (daysSinceStart % parseInt(averageCycleLength)) + 1;

      let currentPhase: "menstrual" | "follicular" | "ovulatory" | "luteal";
      if (cycleDay <= 5) {
        currentPhase = "menstrual";
      } else if (cycleDay <= 13) {
        currentPhase = "follicular";
      } else if (cycleDay <= 16) {
        currentPhase = "ovulatory";
      } else {
        currentPhase = "luteal";
      }

      // Update profile with all onboarding data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          partner_name: partnerName || null,
          last_period_start: lastPeriodStart || null,
          average_cycle_length: parseInt(averageCycleLength),
          love_language: loveLanguage || null,
          dietary_preferences: dietaryPreferences || null,
          favorite_activities: favoriteActivities || null,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Create calendar entries for current cycle
      if (lastPeriodStart) {
        const cycleLength = parseInt(averageCycleLength);
        const menstrualEnd = addDays(periodStart, 4);
        const follicularEnd = addDays(periodStart, 12);
        const ovulatoryEnd = addDays(periodStart, 15);
        const luteaEnd = addDays(periodStart, cycleLength - 1);

        const entries = [];

        // Menstrual phase (days 1-5)
        for (let i = 0; i <= 4; i++) {
          const entryDate = addDays(periodStart, i);
          if (entryDate <= today) {
            entries.push({
              user_id: user.id,
              entry_date: format(entryDate, "yyyy-MM-dd"),
              phase: "menstrual" as const,
              notes: i === 0 ? "Period started" : null,
            });
          }
        }

        // Follicular phase (days 6-13)
        for (let i = 5; i <= 12; i++) {
          const entryDate = addDays(periodStart, i);
          if (entryDate <= today) {
            entries.push({
              user_id: user.id,
              entry_date: format(entryDate, "yyyy-MM-dd"),
              phase: "follicular" as const,
            });
          }
        }

        // Ovulatory phase (days 14-16)
        for (let i = 13; i <= 15; i++) {
          const entryDate = addDays(periodStart, i);
          if (entryDate <= today) {
            entries.push({
              user_id: user.id,
              entry_date: format(entryDate, "yyyy-MM-dd"),
              phase: "ovulatory" as const,
            });
          }
        }

        // Luteal phase (days 17-28)
        for (let i = 16; i < cycleLength; i++) {
          const entryDate = addDays(periodStart, i);
          if (entryDate <= today) {
            entries.push({
              user_id: user.id,
              entry_date: format(entryDate, "yyyy-MM-dd"),
              phase: "luteal" as const,
            });
          }
        }

        if (entries.length > 0) {
          const { error: entriesError } = await supabase
            .from("cycle_entries")
            .upsert(entries, { onConflict: "user_id,entry_date" });

          if (entriesError) {
            console.error("Error creating calendar entries:", entriesError);
          }
        }
      }

      toast({
        title: "Welcome!",
        description: "Your profile is set up. Let's get started!",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = partnerName.trim().length > 0;
  const canProceedStep2 = lastPeriodStart && averageCycleLength;
  const canComplete = canProceedStep1 && canProceedStep2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">Welcome! Let's Get Started</CardTitle>
          <CardDescription className="text-lg">
            Just a few questions to personalize your experience
          </CardDescription>
          <div className="flex justify-center gap-2 mt-6">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Let's start with her name</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This helps us personalize your experience and advice
                </p>
                <Label htmlFor="partner-name">Partner's Name</Label>
                <Input
                  id="partner-name"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g., Sarah"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">When did her last period start?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This helps us predict her current cycle phase
                </p>
                <Label htmlFor="last-period">Last Period Start Date</Label>
                <Input
                  id="last-period"
                  type="date"
                  value={lastPeriodStart}
                  onChange={(e) => setLastPeriodStart(e.target.value)}
                  max={format(new Date(), "yyyy-MM-dd")}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="cycle-length">Average Cycle Length (days)</Label>
                <Select value={averageCycleLength} onValueChange={setAverageCycleLength}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {[21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map((days) => (
                      <SelectItem key={days} value={days.toString()}>
                        {days} days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Most cycles are 28 days, but anywhere from 21-35 is normal
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">What's her primary love language?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This helps us suggest the most meaningful ways to support her
                </p>
                <Label htmlFor="love-language">Love Language</Label>
                <Select value={loveLanguage} onValueChange={setLoveLanguage}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a love language" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    <SelectItem value="words">Words of Affirmation</SelectItem>
                    <SelectItem value="acts">Acts of Service</SelectItem>
                    <SelectItem value="gifts">Receiving Gifts</SelectItem>
                    <SelectItem value="time">Quality Time</SelectItem>
                    <SelectItem value="touch">Physical Touch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Her preferences</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Optional but helpful for personalized suggestions
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dietary">Dietary Preferences/Restrictions</Label>
                    <Textarea
                      id="dietary"
                      value={dietaryPreferences}
                      onChange={(e) => setDietaryPreferences(e.target.value)}
                      placeholder="e.g., vegetarian, loves chocolate, avoids dairy"
                      className="mt-2 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="activities">Favorite Activities</Label>
                    <Textarea
                      id="activities"
                      value={favoriteActivities}
                      onChange={(e) => setFavoriteActivities(e.target.value)}
                      placeholder="e.g., yoga, watching movies, long walks, cooking together"
                      className="mt-2 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <div>
              {step > 1 && (
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Skip for now
              </Button>

              {step < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2)
                  }
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={!canComplete || loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    "Complete"
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
