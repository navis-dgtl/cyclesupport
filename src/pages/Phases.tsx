import { PhaseCard } from "@/components/PhaseCard";
import { cyclePhases } from "@/lib/cycleData";

const Phases = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-foreground">Understanding Her Cycle</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive guide to supporting your wife through each phase of her menstrual cycle.
              Each phase brings different physical, emotional, and mental changes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.values(cyclePhases).map((phase) => (
              <PhaseCard key={phase.name} phase={phase} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phases;