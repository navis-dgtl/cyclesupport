import { LucideIcon } from 'lucide-react';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface LoveLanguageTips {
  words: string[];
  acts: string[];
  gifts: string[];
  time: string[];
  touch: string[];
}

export interface PhaseInfo {
  name: string;
  days: string;
  color: string;
  lightColor: string;
  iconName: string;
  description: string;
  foods: string[];
  supportTips: string[];
  loveLanguageTips: LoveLanguageTips;
}

export const cyclePhases: Record<CyclePhase, PhaseInfo> = {
  menstrual: {
    name: 'Menstrual Phase',
    days: 'Days 1-5',
    color: 'menstrual',
    lightColor: 'menstrual-light',
    iconName: 'Moon',
    description: 'Hormone levels (estrogen & progesterone) are at their lowest. The uterine lining is shedding. Energy is naturally lower. This is a reflective, introspective time.',
    foods: [
      'Iron-rich foods (leafy greens, grass-fed beef, lentils) to replenish blood loss',
      'Omega-3s (wild salmon, walnuts) for anti-inflammatory support',
      'Warming foods (bone broth, stews, ginger tea)',
      'Sea vegetables (kelp, nori) for minerals',
      'Dark chocolate (magnesium)'
    ],
    supportTips: [
      'Lower energy is normal—this isn\'t laziness',
      'She may want more rest and alone time',
      'Physical comfort matters: heating pads, back rubs appreciated',
      'This is not the time for big social plans or demanding activities',
      'Listen more, fix less'
    ],
    loveLanguageTips: {
      words: [
        'Tell her "I know you\'re not feeling your best, and that\'s completely okay"',
        'Send a text: "Just thinking about you. No need to reply, just rest"',
        'Leave a sweet note on her pillow or bathroom mirror',
        'Say "You\'re doing great, even when it doesn\'t feel like it"',
        'Remind her "I love you through all your phases"'
      ],
      acts: [
        'Take over dinner tonight without being asked',
        'Handle the dishes, laundry, or other chores she usually does',
        'Prepare a heating pad and her favorite blanket before she asks',
        'Run her a warm bath with candles',
        'Take care of errands so she can rest'
      ],
      gifts: [
        'Pick up her favorite chocolate or comfort snack on your way home',
        'Surprise her with a cozy new blanket or soft socks',
        'Order her favorite takeout so she doesn\'t have to think about food',
        'Bring home flowers to brighten her space',
        'Get her favorite magazine or book'
      ],
      time: [
        'Offer to watch a movie together—let her pick',
        'Sit with her quietly, even if you\'re both doing different things',
        'Be present without expecting conversation or entertainment',
        'Have a low-key evening at home together',
        'Just be nearby if she needs anything'
      ],
      touch: [
        'Offer a gentle back or shoulder massage without being asked',
        'Cuddle on the couch with no expectations',
        'Hold her hand or put your arm around her',
        'Give her a long, comforting hug',
        'Gently rub her feet or lower back'
      ]
    }
  },
  follicular: {
    name: 'Follicular Phase',
    days: 'Days 6-13',
    color: 'follicular',
    lightColor: 'follicular-light',
    iconName: 'Sprout',
    description: 'Estrogen rises steadily. Energy rebounds. The body is preparing to release an egg. Brain function, mood, and creativity peak. This is the "fresh start" phase.',
    foods: [
      'Light, energizing foods (salads, sprouts, fresh vegetables)',
      'Fermented foods (sauerkraut, kimchi, yogurt) to support estrogen metabolism',
      'Lean proteins (chicken, fish, eggs)',
      'Sprouted beans and seeds',
      'Citrus fruits, berries'
    ],
    supportTips: [
      'She\'ll likely feel more social and energetic',
      'Great time to try new activities or have adventures together',
      'She may be more decisive and action-oriented',
      'Sex drive begins increasing',
      'Good time for important conversations or planning'
    ],
    loveLanguageTips: {
      words: [
        'Tell her "I love seeing you so energized and in your element"',
        'Text her "You\'re amazing—let\'s do something fun this weekend"',
        'Compliment her ideas and decisiveness',
        'Say "I\'m so proud of everything you\'re accomplishing"',
        'Encourage her: "This is your time to shine"'
      ],
      acts: [
        'Plan a fun date or adventure without her having to organize it',
        'Support her projects or goals actively',
        'Help her tackle something on her to-do list',
        'Book that activity she\'s been wanting to try',
        'Take initiative on plans she\'ll enjoy'
      ],
      gifts: [
        'Get tickets to something she\'d love—concert, show, event',
        'Buy supplies for a hobby or project she\'s excited about',
        'Surprise her with something for an upcoming adventure',
        'Bring home fresh flowers for the burst of energy',
        'Get a book or tool for something new she wants to learn'
      ],
      time: [
        'Plan a weekend adventure or day trip together',
        'Try a new restaurant or activity she\'s mentioned',
        'Go for a hike, bike ride, or energetic outing',
        'Have meaningful conversations—she\'s sharp and engaged now',
        'Make plans for things you\'ll both enjoy'
      ],
      touch: [
        'Match her energy with playful physical affection',
        'Dance together in the kitchen',
        'Be spontaneous and romantic',
        'Hold hands during your adventures',
        'Show affection that matches her upbeat mood'
      ]
    }
  },
  ovulatory: {
    name: 'Ovulatory Phase',
    days: 'Days 14-16',
    color: 'ovulatory',
    lightColor: 'ovulatory-light',
    iconName: 'Sun',
    description: 'Estrogen peaks, testosterone surges, then egg is released. This is peak energy, confidence, and communication. Libido is highest. Skin often looks its best.',
    foods: [
      'Light, raw foods (smoothies, fresh salads)',
      'Fiber-rich vegetables (to clear excess estrogen)',
      'Antioxidant-rich fruits (berries, tropical fruits)',
      'Quinoa and other whole grains',
      'Lighter proteins (fish)'
    ],
    supportTips: [
      'Peak fertility window (track if trying to conceive or avoid pregnancy)',
      'She\'s likely feeling most confident and outgoing',
      'Communication comes easily—good for deeper talks',
      'Natural peak in attraction and desire',
      'She may be more direct or assertive than usual'
    ],
    loveLanguageTips: {
      words: [
        'Tell her "You look absolutely beautiful"',
        'Say "I love how confident you are right now"',
        'Compliment her appearance—she\'s likely glowing',
        'Express attraction: "I can\'t take my eyes off you"',
        'Affirm her: "You\'re incredible in every way"'
      ],
      acts: [
        'Plan a romantic evening without her having to ask',
        'Make dinner reservations at a nice place',
        'Take care of everything so she can enjoy feeling her best',
        'Set up a special date night at home',
        'Handle logistics so she can just show up and enjoy'
      ],
      gifts: [
        'Surprise her with lingerie or something that makes her feel sexy',
        'Buy her favorite wine or champagne for a special evening',
        'Get her something she\'s had her eye on',
        'Flowers delivered to her work or home',
        'A small luxury item that shows you notice her'
      ],
      time: [
        'Plan a romantic date night—she\'ll appreciate the effort',
        'Have deep, meaningful conversations—she\'s most articulate now',
        'Spend quality one-on-one time together',
        'Go somewhere that makes her feel special',
        'Be fully present and engaged with her'
      ],
      touch: [
        'Show physical affection freely—she\'s receptive',
        'Be romantic and attentive',
        'Her libido is highest—be responsive and present',
        'Physical connection comes naturally now',
        'Match her energy and desire'
      ]
    }
  },
  luteal: {
    name: 'Luteal Phase',
    days: 'Days 17-28',
    color: 'luteal',
    lightColor: 'luteal-light',
    iconName: 'Flower2',
    description: 'Progesterone rises then falls if no pregnancy occurs. Energy gradually declines. Body temperature rises slightly. The "nesting" phase—focus turns inward. PMS symptoms may emerge in the later days.',
    foods: [
      'Complex carbs (sweet potatoes, squash, brown rice) for serotonin support',
      'B-vitamin rich foods (leafy greens, turkey, chickpeas)',
      'Magnesium-rich foods (pumpkin seeds, dark chocolate, avocado)',
      'Calcium (tahini, almonds, dairy if tolerated)',
      'Roasted vegetables, heartier meals',
      'Reduce caffeine and alcohol (they hit harder now)'
    ],
    supportTips: [
      'Energy and mood may vary—early luteal is often fine, late luteal can be tough',
      'She may be more sensitive or need more reassurance',
      'Comfort food cravings are hormone-driven, not weakness',
      'Help reduce her mental load (the little things feel bigger now)',
      'PMS is real and chemical—validate rather than dismiss',
      'Extra patience, acts of service, and physical comfort go far'
    ],
    loveLanguageTips: {
      words: [
        'Say "You\'re doing so well, even if it doesn\'t feel like it"',
        'Reassure her: "I\'m here for you, whatever you need"',
        'Validate her feelings: "What you\'re feeling is real and makes sense"',
        'Text her "Thinking of you and sending love"',
        'Remind her "You\'re not too much, you\'re just right"'
      ],
      acts: [
        'Take things off her plate without her asking',
        'Handle the mental load—plan meals, do errands',
        'Keep the house tidy so she has one less thing to worry about',
        'Make her favorite comfort food',
        'Do the small tasks that feel big to her right now'
      ],
      gifts: [
        'Bring home her favorite comfort snacks or chocolate',
        'Get her something cozy—soft pajamas, fuzzy socks',
        'Order her favorite takeout so she doesn\'t have to cook',
        'Pick up a face mask or self-care item',
        'Surprise her with something small that says "I\'m thinking of you"'
      ],
      time: [
        'Have a cozy night in—low-key activities only',
        'Watch her favorite comfort show or movie together',
        'Just be present without needing to talk or do anything',
        'Let her set the pace and energy for your time together',
        'Create a calm, peaceful environment to just be'
      ],
      touch: [
        'Offer a massage without expecting anything in return',
        'Give her extra hugs and physical reassurance',
        'Cuddle with no pressure or expectations',
        'Hold her when she needs comfort',
        'Gentle, nurturing touch goes far right now'
      ]
    }
  }
};