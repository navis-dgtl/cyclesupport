import { PhaseCard } from "@/components/PhaseCard";
import { cyclePhases } from "@/lib/cycleData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Phases = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="text-center space-y-2 mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Understanding Her Cycle</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive guide to supporting your wife through each phase of her menstrual cycle.
              Each phase brings different physical, emotional, and mental changes.
            </p>
          </div>

          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">💡 Pro Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Every woman is different, and cycles can vary even for the same person. Use this guide as a 
                starting point, but pay attention to her individual patterns and needs. For personalized advice 
                based on her specific situation, use the AI Assistant.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.values(cyclePhases).map((phase) => (
              <PhaseCard key={phase.name} phase={phase} />
            ))}
          </div>

          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Have Questions?</CardTitle>
              <CardDescription>Get personalized advice from our AI Assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Every situation is unique. Ask the AI Assistant for advice tailored to your specific 
                circumstances, her preferences, and her current phase.
              </p>
              <Button onClick={() => navigate('/assistant')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask AI Assistant
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Phases;
