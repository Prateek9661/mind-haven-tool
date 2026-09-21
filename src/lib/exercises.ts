import type { PersonalContext } from "@/lib/personalisation";

export type ExerciseStep = { text: string; seconds: number };

export type Exercise = {
  id: string;
  title: string;
  subtitle: string;
  steps: ExerciseStep[];
  /** A low tone to hum along with, for the humming exercise. */
  hum?: boolean;
};

const repeat = <T,>(times: number, make: (index: number) => T): T[] =>
  Array.from({ length: times }, (_, index) => make(index));

const BOX_BREATHING: Exercise = {
  id: "box",
  title: "Box breathing 4-4-4-4",
  subtitle: "Even breathing to steady a racing mind",
  steps: [
    { text: "Sit tall. Let your shoulders drop away from your ears.", seconds: 12 },
    ...repeat(9, (index) => [
      { text: `Breathe in slowly — round ${index + 1}`, seconds: 4 },
      { text: "Hold, softly", seconds: 4 },
      { text: "Breathe out, all the way", seconds: 4 },
      { text: "Hold, empty", seconds: 4 },
    ]).flat(),
    { text: "Let the rhythm go. Breathe however you like.", seconds: 12 },
  ],
};

const GROUNDING: Exercise = {
  id: "grounding",
  title: "5-4-3-2-1 grounding",
  subtitle: "Come back to the room through your senses",
  steps: [
    { text: "Look around slowly. Name five things you can see.", seconds: 30 },
    { text: "Notice four things you can feel — chair, floor, fabric, air.", seconds: 25 },
    { text: "Listen for three sounds, near and far.", seconds: 22 },
    { text: "Find two things you can smell, or two you like the smell of.", seconds: 18 },
    { text: "One thing you can taste, or one taste you love.", seconds: 15 },
    { text: "You are here, in this room, in this minute. That's all.", seconds: 12 },
  ],
};

const BODY_SCAN: Exercise = {
  id: "body-scan",
  title: "Body scan",
  subtitle: "Soften from the top of your head to your feet",
  steps: [
    { text: "Close your eyes if that feels safe. Take one long breath out.", seconds: 20 },
    { text: "Bring attention to your scalp and forehead. Let them loosen.", seconds: 25 },
    { text: "Your jaw. Part your teeth slightly. Let the tongue rest.", seconds: 25 },
    { text: "Neck and shoulders — let them fall an inch lower.", seconds: 30 },
    { text: "Arms, down to the hands. Let the fingers uncurl.", seconds: 30 },
    { text: "Chest and belly. Feel them rise and fall on their own.", seconds: 30 },
    { text: "Lower back and hips. Let the chair hold your weight.", seconds: 30 },
    { text: "Legs, down through the knees.", seconds: 30 },
    { text: "Feet and toes. Feel the floor under them.", seconds: 30 },
    { text: "Whole body at once. Soft, heavy, supported.", seconds: 30 },
  ],
};

const TENSE_RELEASE: Exercise = {
  id: "tense-release",
  title: "Tense and release",
  subtitle: "Squeeze, then let go — tension leaves faster this way",
  steps: [
    { text: "Settle in. One slow breath in, one longer out.", seconds: 15 },
    { text: "Squeeze both fists tight. Hold…", seconds: 8 },
    { text: "Release. Notice the difference.", seconds: 12 },
    { text: "Pull your shoulders up to your ears. Hold…", seconds: 8 },
    { text: "Drop them. Let them fall heavy.", seconds: 12 },
    { text: "Scrunch your face — eyes, jaw, everything. Hold…", seconds: 8 },
    { text: "Let it all go smooth.", seconds: 12 },
    { text: "Tighten your belly and chest. Hold…", seconds: 8 },
    { text: "Release, and breathe out fully.", seconds: 12 },
    { text: "Press your feet into the floor. Hold…", seconds: 8 },
    { text: "Release. Let your legs be heavy.", seconds: 12 },
    { text: "Whole body loose now. Stay here a moment.", seconds: 25 },
  ],
};

const SIGH_IT_OUT: Exercise = {
  id: "sigh",
  title: "Sigh it out",
  subtitle: "The fastest way to drop tension — one minute",
  steps: [
    ...repeat(6, () => [
      { text: "Breathe in through the nose… and a second small sip of air on top.", seconds: 5 },
      { text: "Long, audible sigh out through the mouth.", seconds: 5 },
    ]).flat(),
    { text: "Let your breath go back to normal. Feel your body settle.", seconds: 10 },
  ],
};

const HUMMING: Exercise = {
  id: "humming",
  title: "Humming calm",
  subtitle: "Hum on each exhale — a low tone plays to match",
  hum: true,
  steps: [
    { text: "Find the tone playing. Breathe in gently.", seconds: 12 },
    ...repeat(8, () => [
      { text: "Breathe in through the nose", seconds: 4 },
      { text: "Hum out with the tone until your breath runs out", seconds: 8 },
    ]).flat(),
    { text: "Stop humming. Notice the buzz still in your chest.", seconds: 16 },
  ],
};

export const EXERCISES: Exercise[] = [
  BOX_BREATHING,
  GROUNDING,
  BODY_SCAN,
  TENSE_RELEASE,
  SIGH_IT_OUT,
  HUMMING,
];

export function exerciseSeconds(exercise: Exercise) {
  return exercise.steps.reduce((total, step) => total + step.seconds, 0);
}

export function exerciseLength(exercise: Exercise) {
  const minutes = Math.max(1, Math.round(exerciseSeconds(exercise) / 60));
  return `${minutes} min`;
}

const BY_STRUGGLE: Record<string, string> = {
  "Anxiety / restlessness": "grounding",
  "Work stress": "sigh",
  "Poor sleep": "body-scan",
  "Losing focus": "box",
  "Low motivation": "sigh",
  "Feeling burnt out": "tense-release",
};

const BY_GOAL: Record<string, string> = {
  Motivation: "sigh",
  Calm: "grounding",
  "Focus for work": "box",
  "Better sleep": "body-scan",
  Confidence: "humming",
};

export function exerciseForContext(
  context: Partial<PersonalContext> | null | undefined,
): Exercise | null {
  const id =
    (context?.primary_struggle ? BY_STRUGGLE[context.primary_struggle] : undefined) ??
    (context?.goal ? BY_GOAL[context.goal] : undefined);
  if (!id) return null;
  return EXERCISES.find((exercise) => exercise.id === id) ?? null;
}
