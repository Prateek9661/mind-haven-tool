# A sanctuary that rearranges itself around you

Velora will use the answers you save on your profile (who you are, what weighs on you, what you want) to put the right practice first and to suggest a short guided self-care session made for that situation. The Country question goes away.

## What changes for you

**1. Country removed**

The Country field disappears from the profile form. Nothing else on the profile moves. Anything already saved stays in the database, unused.

**2. A recommended session on the home page**

The personalised card grows into a short recommendation:

- A one-line greeting (as today).
- A named session picked from your answers, for example "A 5-minute unwinding reset" or "A focus warm-up before your next task".
- Two or three steps in order, each pointing at something already in Velora — a breathing round at a set rhythm, a specific ambient track, an affirmation to sit with, or a question to bring to the coach.
- A "Start this session" button that scrolls to the first step and switches the sound to the matching track (it starts playing only when you press it).

Sessions are matched to the struggle first, then the goal:

| What weighs on you | Suggested session |
| --- | --- |
| Work stress | Slow it down: 4-7-8 breathing, rain, one thought unloaded to the coach |
| Losing focus | Focus warm-up: 3 steady breaths, lofi beats, name one task |
| Anxiety / restlessness | Grounding: longer exhales, 438Hz tones, an affirmation |
| Poor sleep | Wind-down: soft breathing, forest sounds, let go of today |
| Low motivation | Small start: energising breath, lofi, one tiny first step |
| Feeling burnt out | Permission to rest: gentle breathing, rain, no task at all |

**3. The page reorders and highlights**

The section your session starts with moves directly under the recommendation card and is given a soft highlighted frame; the rest follow in their usual order. So someone who can't focus sees breathing and sounds first, while someone who mostly needs to talk sees the coach first. Without a saved profile, the page keeps today's order exactly.

**4. Wording that fits you**

Small copy touches from your role: the mood buttons and the coach intro speak to work, study, caregiving, or running your own thing, instead of one generic phrasing.

## Notes

- Everything stays in-app guided self-care. Velora does not diagnose or claim clinical treatment.
- Signed-out visitors see the page unchanged, with the existing invite to sign in.

## Technical notes

- `src/lib/personalisation.ts`: add a `SESSION_PLANS` map keyed by struggle with a goal fallback — each entry has `title`, `intro`, `steps[]` (`{ section: "breathing" | "sounds" | "coach" | "affirmation", label }`), `track`, and `mood`. Add `sessionFromContext(context)` and `sectionOrder(context)` returning the ordered section keys.
- `src/components/sanctuary/personal-card.tsx`: render the session title, intro and steps; "Start this session" calls a new `onStartSession(track, sectionId)` prop instead of only setting the mood.
- `src/routes/index.tsx`: hold the ordered section list from `sectionOrder`, render breathing / sounds / coach through a small array map so order is data-driven, pass a `highlighted` flag to the first one, and give each a `ref`/`id` for scroll-to.
- Highlight styling: an extra ring/glow class on the highlighted card in the existing glass-card style — no new colour tokens.
- `src/routes/_authenticated/profile.tsx`: delete the Country input, its form state key and the `country` field in the save payload and zod schema; keep the column in the database.
- `moodFromContext` stays as the source of the suggested mood so the saved `suggested_mood` keeps working; no migration needed.
