import type { MoodId, TrackId } from "@/lib/sanctuary";

export const ROLE_OPTIONS = [
  "Employee",
  "Student",
  "Parent / caregiver",
  "Freelancer / business owner",
  "Other",
] as const;

export const STRUGGLE_OPTIONS = [
  "Work stress",
  "Losing focus",
  "Anxiety / restlessness",
  "Poor sleep",
  "Low motivation",
  "Feeling burnt out",
] as const;

export const GOAL_OPTIONS = [
  "Motivation",
  "Calm",
  "Focus for work",
  "Better sleep",
  "Confidence",
] as const;

export type PersonalContext = {
  role: string | null;
  primary_struggle: string | null;
  goal: string | null;
  condition_note: string | null;
};

export function hasPersonalContext(context: Partial<PersonalContext> | null | undefined) {
  if (!context) return false;
  return Boolean(
    context.role || context.primary_struggle || context.goal || context.condition_note,
  );
}

export function moodFromContext(context: Partial<PersonalContext> | null | undefined): MoodId {
  const struggle = context?.primary_struggle ?? "";
  const goal = context?.goal ?? "";

  if (struggle === "Anxiety / restlessness") return "anxious";
  if (struggle === "Losing focus" || struggle === "Low motivation") return "focus";
  if (struggle === "Poor sleep" || struggle === "Feeling burnt out") return "unwind";
  if (struggle === "Work stress") return "overwhelmed";

  if (goal === "Focus for work" || goal === "Motivation") return "focus";
  if (goal === "Better sleep") return "unwind";
  if (goal === "Calm") return "anxious";
  return "overwhelmed";
}

export function fallbackGreeting(context: Partial<PersonalContext> | null | undefined) {
  const role = context?.role;
  const goal = context?.goal;
  const opener =
    role === "Employee"
      ? "Long day at work?"
      : role === "Student"
        ? "Studying takes a lot out of you."
        : role === "Parent / caregiver"
          ? "You've been holding a lot for others today."
          : role === "Freelancer / business owner"
            ? "Running everything yourself is heavy work."
            : "You made it here, and that counts.";
  const closer =
    goal === "Motivation"
      ? "Let's find a little momentum before the next thing."
      : goal === "Focus for work"
        ? "Let's clear your head for one task at a time."
        : goal === "Better sleep"
          ? "Let's slow the evening down together."
          : goal === "Confidence"
            ? "Let's steady you before you step back out there."
            : "Let's take a few slow breaths together.";
  return `${opener} ${closer}`;
}

export function describeContext(context: Partial<PersonalContext> | null | undefined) {
  if (!hasPersonalContext(context)) return null;
  const parts: string[] = [];
  if (context?.role) parts.push(`They are a ${context.role.toLowerCase()}.`);
  if (context?.primary_struggle)
    parts.push(`What weighs on them most: ${context.primary_struggle.toLowerCase()}.`);
  if (context?.goal) parts.push(`What they want from Velora: ${context.goal.toLowerCase()}.`);
  if (context?.condition_note) parts.push(`In their own words: "${context.condition_note}"`);
  return parts.join(" ");
}
