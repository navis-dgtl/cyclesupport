import { Card } from "@/components/ui/card";
import { PhaseInfo } from "@/lib/cycleData";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface PhaseCardProps {
  phase: PhaseInfo;
}

export const PhaseCard = ({ phase }: PhaseCardProps) => {
  const IconComponent = Icons[phase.iconName as keyof typeof Icons] as LucideIcon;
  
  return (
    <Card className={`p-6 border-2 hover:shadow-lg transition-shadow bg-${phase.lightColor}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <IconComponent className="w-10 h-10 text-primary" />
          <div>
            <h3 className="text-2xl font-bold text-foreground">{phase.name}</h3>
            <p className="text-sm text-muted-foreground">{phase.days}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">What's Happening</h4>
          <p className="text-sm text-foreground/80 leading-relaxed">{phase.description}</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Foods to Prioritize</h4>
          <ul className="space-y-1">
            {phase.foods.map((food, index) => (
              <li key={index} className="text-sm text-foreground/80 flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{food}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Support Tips for You</h4>
          <ul className="space-y-1">
            {phase.supportTips.map((tip, index) => (
              <li key={index} className="text-sm text-foreground/80 flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};