import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, MessageCircle, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Cycle Support</h1>
          </div>
          
          <div className="flex gap-1 items-center">
            <NavLink
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              activeClassName="text-foreground bg-muted"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Phases</span>
            </NavLink>
            
            <NavLink
              to="/calendar"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              activeClassName="text-foreground bg-muted"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </NavLink>
            
            <NavLink
              to="/assistant"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              activeClassName="text-foreground bg-muted"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </NavLink>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="ml-2"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};