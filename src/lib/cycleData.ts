export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface PhaseInfo {
  name: string;
  days: string;
  color: string;
  lightColor: string;
  icon: string;
  description: string;
  foods: string[];
  supportTips: string[];
}

export const cyclePhases: Record<CyclePhase, PhaseInfo> = {
  menstrual: {
    name: 'Menstrual Phase',
    days: 'Days 1-5',
    color: 'menstrual',
    lightColor: 'menstrual-light',
    icon: '🌙',
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
    ]
  },
  follicular: {
    name: 'Follicular Phase',
    days: 'Days 6-13',
    color: 'follicular',
    lightColor: 'follicular-light',
    icon: '🌱',
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
    ]
  },
  ovulatory: {
    name: 'Ovulatory Phase',
    days: 'Days 14-16',
    color: 'ovulatory',
    lightColor: 'ovulatory-light',
    icon: '☀️',
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
    ]
  },
  luteal: {
    name: 'Luteal Phase',
    days: 'Days 17-28',
    color: 'luteal',
    lightColor: 'luteal-light',
    icon: '🌸',
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
    ]
  }
};