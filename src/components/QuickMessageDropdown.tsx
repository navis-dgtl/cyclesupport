import { Heart, Sun, Utensils, Zap, MessageCircle, Moon as MoonIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface QuickMessageDropdownProps {
  onSelectMessageType: (type: string, title: string, prompt: string) => void;
  currentPhase: string | null;
  partnerName: string;
  dietaryPreferences: string;
  favoriteActivities: string;
}

export const QuickMessageDropdown = ({
  onSelectMessageType,
  currentPhase,
  partnerName,
  dietaryPreferences,
  favoriteActivities
}: QuickMessageDropdownProps) => {
  
  const phaseName = currentPhase || 'current';
  const partner = partnerName || 'she';

  const messageTypes = [
    {
      type: 'support',
      title: 'Send Support',
      icon: Heart,
      prompt: `${partner} is currently in the ${phaseName} phase. Can you write me a short, sweet, and supportive text message I can send her right now? Keep it personal and loving, around 2-3 sentences.`
    },
    {
      type: 'morning',
      title: 'Good Morning Text',
      icon: Sun,
      prompt: `${partner} is in the ${phaseName} phase. Write me a sweet good morning text message that acknowledges how she might be feeling today. Keep it warm and phase-appropriate, 2-3 sentences.`
    },
    {
      type: 'dinner',
      title: 'Dinner Suggestion',
      icon: Utensils,
      prompt: `${partner} is in the ${phaseName} phase${dietaryPreferences ? `. Her dietary preferences: ${dietaryPreferences}` : ''}. Suggest a meal I could make or order for her tonight that would be both comforting and good for this phase. Include a sweet message I could send asking if she'd like that for dinner.`
    },
    {
      type: 'activity',
      title: 'Activity Idea',
      icon: Zap,
      prompt: `${partner} is in the ${phaseName} phase${favoriteActivities ? `. Her favorite activities include: ${favoriteActivities}` : ''}. Suggest something we could do together that matches her likely energy level for this phase. Include a message I could send suggesting it.`
    },
    {
      type: 'checkin',
      title: 'Check-in Message',
      icon: MessageCircle,
      prompt: `${partner} is in the ${phaseName} phase. Write me a thoughtful "just checking in" text message. Not overbearing, just showing I'm thinking about her. Phase-appropriate tone, 2-3 sentences.`
    },
    {
      type: 'goodnight',
      title: 'Goodnight Text',
      icon: MoonIcon,
      prompt: `${partner} is in the ${phaseName} phase. Write me a sweet bedtime message that acknowledges the phase and helps her feel loved as she winds down. 2-3 sentences.`
    },
    {
      type: 'appreciation',
      title: 'Appreciation Message',
      icon: Sparkles,
      prompt: `Write me a heartfelt message expressing gratitude and appreciation for ${partner}. Make it specific and genuine, not generic. Consider that she's in the ${phaseName} phase. 2-4 sentences.`
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-auto py-6 flex items-center gap-2 w-full">
          <Heart className="h-6 w-6" />
          <span className="flex-1 text-left">Send Message</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-popover border border-border z-50">
        {messageTypes.map((msgType) => {
          const Icon = msgType.icon;
          return (
            <DropdownMenuItem
              key={msgType.type}
              onClick={() => onSelectMessageType(msgType.type, msgType.title, msgType.prompt)}
              className="cursor-pointer"
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{msgType.title}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
