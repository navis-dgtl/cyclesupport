import { cyclePhases } from "@/lib/cycleData";
import { PhaseCard } from "@/components/PhaseCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const Help = () => {
  const phaseArray = Object.values(cyclePhases);
  
  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Cycle Phase Reference</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn about the four phases of the menstrual cycle and how to support your partner through each one
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {phaseArray.map((phase) => (
            <PhaseCard key={phase.name} phase={phase} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Understanding the Full Cycle</CardTitle>
            <CardDescription>Key insights for supportive partners</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">The cycle is a journey, not a problem to fix</h3>
              <p className="text-muted-foreground">
                Each phase has its own unique energy and needs. Rather than trying to "fix" 
                challenging phases, focus on understanding and supporting her through the natural rhythm.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Track patterns together</h3>
              <p className="text-muted-foreground">
                Use the Calendar feature to log what works and what doesn't. Over time, you'll 
                discover patterns that help you both prepare for and navigate each phase more smoothly.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Communication is everything</h3>
              <p className="text-muted-foreground">
                Check in regularly about what she needs. What works one cycle might not work the next. 
                Create a safe space for her to express her needs without judgment.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Small gestures have big impact</h3>
              <p className="text-muted-foreground">
                Especially during challenging phases, simple acts of service and understanding can mean 
                the world. A heating pad, her favorite snack, or just sitting with her without trying 
                to solve anything can be incredibly supportive.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;
