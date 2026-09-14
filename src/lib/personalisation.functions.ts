import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  ROLE_OPTIONS,
  STRUGGLE_OPTIONS,
  GOAL_OPTIONS,
  describeContext,
  fallbackGreeting,
  moodFromContext,
} from "@/lib/personalisation";
import { MOODS } from "@/lib/sanctuary";

const inputSchema = z.object({
  role: z.enum(ROLE_OPTIONS).nullable(),
  primary_struggle: z.enum(STRUGGLE_OPTIONS).nullable(),
  goal: z.enum(GOAL_OPTIONS).nullable(),
  condition_note: z.string().trim().max(600).nullable(),
});

export const savePersonalContext = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const suggestedMood = moodFromContext(data);
    let greeting = fallbackGreeting(data);

    const key = process.env["LOVABLE_API_KEY"];
    const summary = describeContext(data);

    if (key && summary) {
      try {
        const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
        const { streamText } = await import("ai");
        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3.6-flash"),
          system:
            "You are a warm, calming wellness coach writing a single personalised welcome line for a relaxation app called Velora. Reply with 1-2 short sentences, under 200 characters, second person, gentle and encouraging. No quotes, no emojis, no lists.",
          prompt: `Write the welcome line for this person. ${summary}`,
        });
        const text = (await result.text).trim();
        if (text) greeting = text.replace(/^["']|["']$/g, "").slice(0, 280);
      } catch (error) {
        console.error("personalisation greeting failed", error);
      }
    }

    const mood = MOODS.some((m) => m.id === suggestedMood) ? suggestedMood : "overwhelmed";

    const { error } = await context.supabase.from("profiles").upsert({
      id: context.userId,
      role: data.role,
      primary_struggle: data.primary_struggle,
      goal: data.goal,
      condition_note: data.condition_note,
      personalised_greeting: greeting,
      suggested_mood: mood,
      personalised_at: new Date().toISOString(),
    });

    if (error) throw new Error(error.message);

    return { greeting, suggestedMood: mood };
  });
