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

export type SectionId = "breathing" | "sounds" | "exercises" | "coach";

export type SessionStep = {
  section: SectionId | "affirmation";
  label: string;
};

export type SessionPlan = {
  title: string;
  intro: string;
  steps: SessionStep[];
  track: TrackId;
  mood: MoodId;
};

const WORK_STRESS: SessionPlan = {
  title: "Slow it down",
  intro: "About five minutes to let the day stop pressing on you.",
  steps: [
    { section: "breathing", label: "Three rounds of 4-7-8 breathing" },
    { section: "exercises", label: "Sigh it out — a minute of long exhales" },
    { section: "sounds", label: "Rain on Window, softly in the background" },
    { section: "coach", label: "Tell your coach the one thing weighing most" },
  ],
  track: "rain",
  mood: "overwhelmed",
};

const LOSING_FOCUS: SessionPlan = {
  title: "Focus warm-up",
  intro: "A short runway before the task you keep circling.",
  steps: [
    { section: "breathing", label: "Three steady breaths to settle" },
    { section: "exercises", label: "Box breathing 4-4-4-4 to gather your attention" },
    { section: "sounds", label: "Lofi Focus Beats for a gentle rhythm" },
    { section: "coach", label: "Name the one task you'll start with" },
  ],
  track: "lofi",
  mood: "focus",
};

const ANXIOUS: SessionPlan = {
  title: "Grounding session",
  intro: "Longer exhales and steady tone to bring you back to now.",
  steps: [
    { section: "exercises", label: "5-4-3-2-1 grounding through your senses" },
    { section: "breathing", label: "Follow the long exhale a few rounds" },
    { section: "sounds", label: "438Hz Healing Waves holding you steady" },
    { section: "affirmation", label: "Sit with today's affirmation at the top" },
  ],
  track: "healing",
  mood: "anxious",
};

const POOR_SLEEP: SessionPlan = {
  title: "Evening wind-down",
  intro: "A slow close to the day so sleep has somewhere to land.",
  steps: [
    { section: "sounds", label: "Forest Birds & Stream, volume low" },
    { section: "exercises", label: "A slow body scan from head to feet" },
    { section: "breathing", label: "Soft 4-7-8 breathing until your shoulders drop" },
    { section: "coach", label: "Let go of one thing from today out loud" },
  ],
  track: "forest",
  mood: "unwind",
};

const LOW_MOTIVATION: SessionPlan = {
  title: "A small start",
  intro: "Not the whole mountain — just the first honest step.",
  steps: [
    { section: "breathing", label: "A few awakening breaths" },
    { section: "sounds", label: "Lofi Focus Beats to carry you along" },
    { section: "coach", label: "Pick one tiny first step with your coach" },
  ],
  track: "lofi",
  mood: "focus",
};

const BURNT_OUT: SessionPlan = {
  title: "Permission to rest",
  intro: "Nothing to achieve here. Just a few minutes that ask nothing of you.",
  steps: [
    { section: "sounds", label: "Rain on Window, no task attached" },
    { section: "breathing", label: "Breathe along for as long as feels kind" },
    { section: "affirmation", label: "Let today's affirmation be enough" },
  ],
  track: "rain",
  mood: "unwind",
};

export const SESSION_PLANS: Record<string, SessionPlan> = {
  "Work stress": WORK_STRESS,
  "Losing focus": LOSING_FOCUS,
  "Anxiety / restlessness": ANXIOUS,
  "Poor sleep": POOR_SLEEP,
  "Low motivation": LOW_MOTIVATION,
  "Feeling burnt out": BURNT_OUT,
};

const GOAL_PLANS: Record<string, SessionPlan> = {
  Motivation: LOW_MOTIVATION,
  Calm: ANXIOUS,
  "Focus for work": LOSING_FOCUS,
  "Better sleep": POOR_SLEEP,
  Confidence: ANXIOUS,
};

export function sessionFromContext(
  context: Partial<PersonalContext> | null | undefined,
): SessionPlan | null {
  if (!hasPersonalContext(context)) return null;
  const byStruggle = context?.primary_struggle
    ? SESSION_PLANS[context.primary_struggle]
    : undefined;
  if (byStruggle) return byStruggle;
  const byGoal = context?.goal ? GOAL_PLANS[context.goal] : undefined;
  return byGoal ?? WORK_STRESS;
}

const ROTATION: SessionPlan[] = [ANXIOUS, BURNT_OUT, LOSING_FOCUS, POOR_SLEEP, WORK_STRESS];

/** A gentler, different plan to try when the first one didn't land. */
export function alternativeSession(current: SessionPlan | null | undefined): SessionPlan {
  const index = ROTATION.findIndex((plan) => plan.title === current?.title);
  return ROTATION[(index + 1) % ROTATION.length]!;
}

const DEFAULT_ORDER: SectionId[] = ["breathing", "sounds", "exercises", "coach"];

export function sectionOrder(context: Partial<PersonalContext> | null | undefined): SectionId[] {
  const plan = sessionFromContext(context);
  if (!plan) return DEFAULT_ORDER;
  const lead = plan.steps.find((step) => step.section !== "affirmation")?.section as
    | SectionId
    | undefined;
  if (!lead) return DEFAULT_ORDER;
  return [lead, ...DEFAULT_ORDER.filter((section) => section !== lead)];
}

export function roleTone(role: string | null | undefined) {
  switch (role) {
    case "Employee":
      return {
        moodHeading: "How are you arriving at work today?",
        coachIntro:
          "Hello. Work can take more than it gives some days. Set a little of it down here — what's on your mind?",
      };
    case "Student":
      return {
        moodHeading: "How are you arriving at your studies today?",
        coachIntro:
          "Hello. Studying asks a lot of one mind. Whatever's swirling, you can say it here — what's on your mind?",
      };
    case "Parent / caregiver":
      return {
        moodHeading: "How are you arriving today, after caring for everyone else?",
        coachIntro:
          "Hello. You've been holding a lot for other people. This space is only yours — what's on your mind?",
      };
    case "Freelancer / business owner":
      return {
        moodHeading: "How are you arriving today, between everything you run?",
        coachIntro:
          "Hello. Carrying the whole thing yourself is heavy. Put a piece of it down here — what's on your mind?",
      };
    default:
      return {
        moodHeading: "How are you arriving today?",
        coachIntro:
          "Hello. Whatever today has been like, you can set it down here for a moment. What's on your mind?",
      };
  }
}
