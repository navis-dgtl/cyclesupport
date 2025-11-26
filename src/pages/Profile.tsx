import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, BookOpen, MessageSquare, BarChart } from "lucide-react";
import { format } from "date-fns";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [loveLanguage, setLoveLanguage] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState("");
  const [favoriteActivities, setFavoriteActivities] = useState("");
  const [lastPeriodStart, setLastPeriodStart] = useState("");
  const [averageCycleLength, setAverageCycleLength] = useState("28");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setName(data.name || "");
        setPartnerName(data.partner_name || "");
        setLoveLanguage(data.love_language || "");
        setDietaryPreferences(data.dietary_preferences || "");
        setFavoriteActivities(data.favorite_activities || "");
        setLastPeriodStart(data.last_period_start || "");
        setAverageCycleLength(data.average_cycle_length?.toString() || "28");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name,
          partner_name: partnerName,
          love_language: loveLanguage,
          dietary_preferences: dietaryPreferences,
          favorite_activities: favoriteActivities,
          last_period_start: lastPeriodStart || null,
          average_cycle_length: parseInt(averageCycleLength),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Customize your profile to get personalized support advice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner-name">Partner's Name</Label>
                <Input
                  id="partner-name"
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Her name"
                />
                <p className="text-sm text-muted-foreground">
                  Helps personalize AI responses
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="love-language">Primary Love Language</Label>
                <Select value={loveLanguage} onValueChange={setLoveLanguage}>
                  <SelectTrigger>
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
                <p className="text-sm text-muted-foreground">
                  How she most feels loved and supported
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietary">Dietary Preferences/Restrictions</Label>
                <Textarea
                  id="dietary"
                  value={dietaryPreferences}
                  onChange={(e) => setDietaryPreferences(e.target.value)}
                  placeholder="e.g., vegetarian, loves chocolate, avoids dairy, allergies"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activities">Favorite Activities</Label>
                <Textarea
                  id="activities"
                  value={favoriteActivities}
                  onChange={(e) => setFavoriteActivities(e.target.value)}
                  placeholder="e.g., yoga, watching movies, long walks, cooking together"
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="last-period">Last Period Start Date</Label>
                  <Input
                    id="last-period"
                    type="date"
                    value={lastPeriodStart}
                    onChange={(e) => setLastPeriodStart(e.target.value)}
                    max={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cycle-length">Average Cycle Length</Label>
                  <Select value={averageCycleLength} onValueChange={setAverageCycleLength}>
                    <SelectTrigger>
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
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resources Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>
              Quick access to helpful features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => navigate('/phases')}
            >
              <BookOpen className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Phase Guide</div>
                <div className="text-xs text-muted-foreground">Learn about all 4 phases</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => navigate('/assistant')}
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">AI Assistant</div>
                <div className="text-xs text-muted-foreground">Get personalized advice</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => navigate('/insights')}
            >
              <BarChart className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Cycle Insights</div>
                <div className="text-xs text-muted-foreground">View patterns & trends</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Sign out of your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;