import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
      // Redirect authenticated users to home
      if (session?.user) {
        navigate(ROUTES.HOME);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          navigate(ROUTES.HOME);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md glass-panel">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-semibold text-foreground">
                Welcome to VibeFlow
              </h1>
              <p className="text-muted-foreground">
                Please sign in to continue
              </p>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="w-full"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate(ROUTES.SIGNUP)}
                variant="outline"
                className="w-full"
              >
                Create Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
