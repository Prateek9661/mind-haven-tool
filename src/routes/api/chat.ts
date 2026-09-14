import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayRunId,
  getLovableAiGatewayResponseHeaders,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";

type ChatRequestBody = { messages?: unknown; mood?: unknown; profile?: unknown };

const BASE_PROMPT =
  "You are a warm, supportive, and calming mind coach. Keep answers short, empathetic, and reassuring to help the user destress. Use plain, gentle language, two to four sentences, and when helpful offer one small grounding or breathing step the user can do right now. Never give medical diagnoses; if someone is in crisis, kindly encourage them to reach out to a trusted person or local emergency services.";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        const messages = body.messages;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const mood = typeof body.mood === "string" && body.mood ? body.mood : null;
        const profile =
          typeof body.profile === "string" && body.profile ? body.profile.slice(0, 900) : null;

        let system = BASE_PROMPT;
        if (profile) {
          system += `\n\nWhat you already know about this person: ${profile} Use this quietly — reference their situation naturally, never repeat it back as a list and never ask them to explain it again.`;
        }
        if (mood) {
          system += `\n\nThe user has said they are currently feeling: "${mood}". Gently tailor your tone and suggestions to that state.`;
        }

        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createLovableAiGatewayProvider(key, initialRunId);

        const result = streamText({
          model: gateway("google/gemini-3.6-flash"),
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          headers: getLovableAiGatewayResponseHeaders(undefined, {
            ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
          }),
        });

        return withLovableAiGatewayRunIdHeader(response, gateway);
      },
    },
  },
});
