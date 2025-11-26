import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      console.log('[ProtectedRoute] Checking auth and onboarding...');
      
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[ProtectedRoute] Session:', !!session);
      setSession(session);
      setUser(session?.user ?? null);

      // Check onboarding status if authenticated and not on onboarding page
      if (session?.user && location.pathname !== '/onboarding') {
        console.log('[ProtectedRoute] Checking onboarding for user:', session.user.id);
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .maybeSingle();

          console.log('[ProtectedRoute] Profile data:', profile, 'Error:', error);

          // If no profile exists or onboarding not completed, redirect to onboarding
          if (!profile || !profile.onboarding_completed) {
            console.log('[ProtectedRoute] Needs onboarding');
            setNeedsOnboarding(true);
          }
        } catch (error) {
          console.error('[ProtectedRoute] Error checking onboarding status:', error);
        }
      } else {
        console.log('[ProtectedRoute] Skipping onboarding check (on onboarding page or no user)');
      }

      setLoading(false);
    };

    checkAuthAndOnboarding();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[ProtectedRoute] Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !session) {
    return <Navigate to="/auth" replace />;
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
