import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { describeContext } from "@/lib/personalisation";
import { MOODS, DEFAULT_SUGGESTIONS, type MoodId } from "@/lib/sanctuary";
import { cn } from "@/lib/utils";

export function CoachChat({
  mood,
  intro = "Hello. Whatever today has been like, you can set it down here for a moment. What's on your mind?",
}: {
  mood: MoodId | null;
  intro?: string;
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const moodLabel = MOODS.find((m) => m.id === mood)?.label ?? null;
  const moodRef = useRef<string | null>(moodLabel);
  moodRef.current = moodLabel;

  const { user } = useSession();
  const { data: profile } = useQuery({
    queryKey: ["profile-context", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, primary_struggle, goal, condition_note")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const profileSummary = describeContext(profile ?? null);
  const profileRef = useRef<string | null>(profileSummary);
  profileRef.current = profileSummary;

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages: msgs }) => ({
        body: { messages: msgs, mood: moodRef.current, profile: profileRef.current },
      }),
    }),
    onError: (error) => {
      console.error(error);
      toast.error("Your coach couldn't respond just now. Please try again in a moment.");
    },
  });

  const busy = status === "submitted" || status === "streaming";
  const suggestions = MOODS.find((m) => m.id === mood)?.suggestions ?? DEFAULT_SUGGESTIONS;

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status === "ready") textareaRef.current?.focus();
  }, [status]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    void sendMessage({ text: value });
    setInput("");
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  };

  return (
    <section className="glass-card animate-float-up flex flex-col overflow-hidden" aria-label="AI mind coach">
      <div className="border-b border-border/70 px-6 py-5 text-center">
        <h2 className="text-lg font-semibold text-foreground">Your AI Mind Coach</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A quiet space to think out loud. Nothing is saved.
        </p>
      </div>

      <Conversation className="max-h-[26rem] min-h-[16rem] flex-1">
        <ConversationContent className="gap-5 px-5 py-6 sm:px-7">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-md py-8 text-center text-base leading-relaxed text-muted-foreground">
              {intro}
            </div>
          ) : null}

          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent
                className={cn(
                  "text-base leading-relaxed",
                  message.role === "assistant" && "bg-transparent p-0 text-foreground",
                  message.role === "user" &&
                    "rounded-3xl bg-primary px-5 py-3 text-primary-foreground",
                )}
              >
                {message.parts.map((part, index) =>
                  part.type === "text" ? (
                    <MessageResponse key={index}>{part.text}</MessageResponse>
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}

          {status === "submitted" ? (
            <Shimmer className="text-base">Taking a breath with you…</Shimmer>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="flex flex-wrap gap-2 px-5 pb-4 sm:px-7">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => send(suggestion)}
            disabled={busy}
            className="min-h-11 rounded-full bg-secondary px-5 text-sm font-medium text-primary transition-colors hover:bg-accent disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="px-5 pb-6 sm:px-7">
        <PromptInput
          onSubmit={(_, event) => {
            event.preventDefault();
            send(input);
          }}
          className="rounded-3xl"
        >
          <PromptInputTextarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            placeholder="Say anything — there's no wrong way to start."
            className="text-base"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={!input.trim() && !busy} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </section>
  );
}
