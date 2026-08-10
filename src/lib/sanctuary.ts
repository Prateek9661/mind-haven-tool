export type TrackId = "rain" | "lofi" | "forest" | "healing";

export type MoodId = "overwhelmed" | "focus" | "anxious" | "unwind";

export type Mood = {
  id: MoodId;
  label: string;
  note: string;
  track: TrackId;
  suggestions: string[];
};

export const MOODS: Mood[] = [
  {
    id: "overwhelmed",
    label: "Feeling Overwhelmed",
    note: "Let's slow everything down together. Rain is playing softly.",
    track: "rain",
    suggestions: [
      "Everything feels like too much right now",
      "Help me put my thoughts in order",
      "How do I stop spiralling?",
    ],
  },
  {
    id: "focus",
    label: "Need Deep Focus",
    note: "Gentle beats on. One task at a time — that's all today asks.",
    track: "lofi",
    suggestions: [
      "I'm feeling distracted at work",
      "Help me start a task I keep avoiding",
      "Set my intention for this hour",
    ],
  },
  {
    id: "anxious",
    label: "Anxious / Restless",
    note: "Healing tones are on. You are safe in this moment.",
    track: "healing",
    suggestions: [
      "Help me calm down right now",
      "My chest feels tight and restless",
      "Ground me in the present moment",
    ],
  },
  {
    id: "unwind",
    label: "Ready to Unwind",
    note: "Forest sounds are drifting in. The day can rest now.",
    track: "forest",
    suggestions: [
      "Guide me through a 2-minute reset",
      "Help me let go of today",
      "I want to sleep peacefully tonight",
    ],
  },
];

export const DEFAULT_SUGGESTIONS = [
  "Help me calm down right now",
  "I'm feeling distracted at work",
  "Guide me through a 2-minute reset",
];

export type Track = {
  id: TrackId;
  title: string;
  subtitle: string;
};

export const TRACKS: Track[] = [
  { id: "rain", title: "Rain on Window", subtitle: "Soft downpour · steady & sheltering" },
  { id: "lofi", title: "Lofi Focus Beats", subtitle: "Warm chords · slow pulse" },
  { id: "forest", title: "Forest Birds & Stream", subtitle: "Morning woods · flowing water" },
  { id: "healing", title: "438Hz Healing Waves", subtitle: "Pure tone · slow breathing swell" },
];

export const AFFIRMATIONS = [
  "You are allowed to move at the speed of your own breath.",
  "This moment is enough. You are enough.",
  "Softness is not weakness — it is how you last.",
  "Nothing urgent lives inside this next breath.",
  "You can begin again, gently, as many times as you need.",
  "Let your shoulders drop. The day can hold itself for a minute.",
  "Peace is not somewhere else. It is here, waiting quietly.",
  "You have survived every hard day so far. Rest is part of the work.",
  "Slow is still forward.",
  "Be as kind to yourself as you would be to a dear friend.",
];
