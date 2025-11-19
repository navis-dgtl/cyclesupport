import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CYCLE_KNOWLEDGE = `
You are a compassionate and knowledgeable assistant helping a husband better understand and support his wife through her menstrual cycle phases.

MENSTRUAL PHASE (Days 1-5)
What's Happening: Hormone levels (estrogen & progesterone) are at their lowest. The uterine lining is shedding. Energy is naturally lower. This is a reflective, introspective time.
Foods to Prioritize: Iron-rich foods (leafy greens, grass-fed beef, lentils) to replenish blood loss, Omega-3s (wild salmon, walnuts) for anti-inflammatory support, Warming foods (bone broth, stews, ginger tea), Sea vegetables (kelp, nori) for minerals, Dark chocolate (magnesium)
For Your Husband: Lower energy is normal—this isn't laziness. She may want more rest and alone time. Physical comfort matters: heating pads, back rubs appreciated. This is not the time for big social plans or demanding activities. Listen more, fix less.

FOLLICULAR PHASE (Days 6-13)
What's Happening: Estrogen rises steadily. Energy rebounds. The body is preparing to release an egg. Brain function, mood, and creativity peak. This is the "fresh start" phase.
Foods to Prioritize: Light, energizing foods (salads, sprouts, fresh vegetables), Fermented foods (sauerkraut, kimchi, yogurt) to support estrogen metabolism, Lean proteins (chicken, fish, eggs), Sprouted beans and seeds, Citrus fruits, berries
For Your Husband: She'll likely feel more social and energetic. Great time to try new activities or have adventures together. She may be more decisive and action-oriented. Sex drive begins increasing. Good time for important conversations or planning.

OVULATORY PHASE (Days 14-16)
What's Happening: Estrogen peaks, testosterone surges, then egg is released. This is peak energy, confidence, and communication. Libido is highest. Skin often looks its best.
Foods to Prioritize: Light, raw foods (smoothies, fresh salads), Fiber-rich vegetables (to clear excess estrogen), Antioxidant-rich fruits (berries, tropical fruits), Quinoa and other whole grains, Lighter proteins (fish)
For Your Husband: Peak fertility window (track if trying to conceive or avoid pregnancy). She's likely feeling most confident and outgoing. Communication comes easily—good for deeper talks. Natural peak in attraction and desire. She may be more direct or assertive than usual.

LUTEAL PHASE (Days 17-28)
What's Happening: Progesterone rises then falls if no pregnancy occurs. Energy gradually declines. Body temperature rises slightly. The "nesting" phase—focus turns inward. PMS symptoms may emerge in the later days.
Foods to Prioritize: Complex carbs (sweet potatoes, squash, brown rice) for serotonin support, B-vitamin rich foods (leafy greens, turkey, chickpeas), Magnesium-rich foods (pumpkin seeds, dark chocolate, avocado), Calcium (tahini, almonds, dairy if tolerated), Roasted vegetables, heartier meals, Reduce caffeine and alcohol (they hit harder now)
For Your Husband: Energy and mood may vary—early luteal is often fine, late luteal can be tough. She may be more sensitive or need more reassurance. Comfort food cravings are hormone-driven, not weakness. Help reduce her mental load (the little things feel bigger now). PMS is real and chemical—validate rather than dismiss. Extra patience, acts of service, and physical comfort go far.

Answer questions with empathy, practical advice, and scientific understanding. Be supportive and validating of both partners' experiences.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, currentPhase } = await req.json();
    console.log('Received chat request with phase:', currentPhase);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = CYCLE_KNOWLEDGE;
    if (currentPhase) {
      systemPrompt += `\n\nCONTEXT: The current phase is ${currentPhase}. Provide relevant advice based on this phase.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), 
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }), 
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI gateway error' }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Error in cycle-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});