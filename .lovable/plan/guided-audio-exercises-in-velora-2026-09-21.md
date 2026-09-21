# Guided audio exercises in Velora

A new "Guided exercises" area on the home page, under the sounds. Each exercise runs itself: on-screen steps that advance on a timer, with a soft chime marking each change, over the ambient sound already playing. Nothing to download, works offline.

## The exercises

| Exercise | Length | What it does |
| --- | --- | --- |
| Box breathing 4-4-4-4 | 3 min | Even breathing to steady a racing mind |
| 5-4-3-2-1 grounding | 2 min | Notice five things you see, four you feel, three you hear, two you smell, one you taste |
| Body scan | 5 min | Attention moves slowly from head to feet, letting each part soften |
| Tense and release | 4 min | Squeeze then release each muscle group in turn |
| Sigh it out | 1 min | Double inhale, long audible exhale — the fastest way to drop tension |
| Humming calm | 2 min | Hum on each exhale with a matching low tone to hum along to |

## How it feels to use

- A row of exercise cards: name, length, one-line description, and a Begin button.
- When one starts, the card opens into a calm player: the current instruction in large text, a soft progress ring, the time left, and Pause / Skip step / Finish.
- A gentle chime at each step change and a warmer closing tone at the end, so you can keep your eyes closed the whole way.
- Ambient sound keeps playing underneath; volume dips slightly during an exercise so the cues are clear.
- On finishing, the existing "How do you feel now?" check-in appears, so the exercise counts toward your day and week chart just like a session does.

## Personalisation

Your saved answers decide which exercise is suggested first and marked "Picked for you":

- Anxiety / restlessness → 5-4-3-2-1 grounding
- Work stress → Sigh it out
- Poor sleep → Body scan
- Losing focus → Box breathing
- Low motivation → Sigh it out
- Feeling burnt out → Tense and release

Recommended sessions gain an exercise step, so "Start this session" now leads into a real guided exercise rather than only a suggestion.

## Technical notes

- `src/lib/exercises.ts`: `Exercise` type (`id`, `title`, `subtitle`, `totalSeconds`, `steps: { text, seconds }[]`, `cue?`), the six exercise definitions, and `exerciseForContext(context)` mapping struggle → exercise id with a goal fallback.
- `src/lib/ambient-audio.ts`: add `chime(kind: "step" | "end")` and `hum(on: boolean)` to `AmbientEngine` — short oscillator + gain envelopes through the existing master gain; add `duck(factor)` to lower ambience during an exercise.
- `src/components/sanctuary/exercise-player.tsx`: card grid plus the running player, driven by a single `setInterval` on elapsed seconds; derives the current step, calls the chime on step boundaries, cleans up on unmount and on Finish.
- `src/routes/index.tsx`: render `<ExercisePlayer>` as a new `"exercises"` section in the data-driven section list; `sectionOrder` and `SectionId` in `src/lib/personalisation.ts` extend to include it. On exercise completion, set `activePlan` (a lightweight plan wrapping the exercise title) and bump `round` so `SessionFeedback` shows.
- Session plans gain an `{ section: "exercises", label }` step where appropriate; `SESSION_PLANS` labels updated accordingly.
- No new database tables — completions reuse `mood_checkins` via the existing feedback flow.
