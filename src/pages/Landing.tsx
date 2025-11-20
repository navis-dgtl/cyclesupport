import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, MessageCircle, Moon, Sprout, Sun, Flower2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import logoHeart from "@/assets/logo-heart.png";

const Landing = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        navigate('/phases');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        navigate('/phases');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <img src={logoHeart} alt="Cycle Support Logo" className="w-16 h-16 mx-auto" />
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Cycle Support
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive guide to supporting your partner through each phase of her menstrual cycle
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Everything You Need to Be Supportive
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center space-y-4">
              <img src={logoHeart} alt="Phase Guide" className="w-12 h-12 mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">Phase Guide</h3>
              <p className="text-muted-foreground">
                Learn about all four phases with detailed information on what's happening, foods to prioritize, and practical support tips
              </p>
            </Card>
            <Card className="p-6 text-center space-y-4">
              <Calendar className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">Cycle Calendar</h3>
              <p className="text-muted-foreground">
                Track and visualize her cycle phases with an easy-to-use calendar interface
              </p>
            </Card>
            <Card className="p-6 text-center space-y-4">
              <MessageCircle className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">AI Assistant</h3>
              <p className="text-muted-foreground">
                Get personalized advice and answers to your questions about cycle support
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Phases Preview */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Understanding the Four Phases
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center space-y-3">
              <Moon className="w-10 h-10 text-primary mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">Menstrual</h3>
              <p className="text-sm text-muted-foreground">Days 1-5</p>
              <p className="text-sm text-muted-foreground">Rest and reflection phase</p>
            </Card>
            <Card className="p-6 text-center space-y-3">
              <Sprout className="w-10 h-10 text-primary mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">Follicular</h3>
              <p className="text-sm text-muted-foreground">Days 6-13</p>
              <p className="text-sm text-muted-foreground">Fresh start phase</p>
            </Card>
            <Card className="p-6 text-center space-y-3">
              <Sun className="w-10 h-10 text-primary mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">Ovulatory</h3>
              <p className="text-sm text-muted-foreground">Days 14-16</p>
              <p className="text-sm text-muted-foreground">Peak energy phase</p>
            </Card>
            <Card className="p-6 text-center space-y-3">
              <Flower2 className="w-10 h-10 text-primary mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">Luteal</h3>
              <p className="text-sm text-muted-foreground">Days 17-28</p>
              <p className="text-sm text-muted-foreground">Nesting phase</p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to Be a More Supportive Partner?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of partners who are learning to better understand and support their loved ones through every phase
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Start Your Journey
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground border-t border-border">
        <p>© 2025 Cycle Support. Built with care for supportive partners.</p>
      </footer>
    </div>
  );
};

export default Landing;
