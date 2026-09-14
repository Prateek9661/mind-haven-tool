# Personal Wellbeing Profile

Let each person tell Velora about their situation, and use it to personalise the sanctuary.

## What the user gets

**On the profile page — a new "About your mind" section** with guided questions:
- Who you are: Employee, Student, Parent / caregiver, Freelancer / business owner, Other
- What's weighing on you most: Work stress, Losing focus, Anxiety / restlessness, Poor sleep, Low motivation, Feeling burnt out
- What you want from Velora: Motivation, Calm, Focus for work, Better sleep, Confidence
- One open box: "Tell us anything else about how you've been feeling lately" (up to 600 characters)

Saved with the rest of their profile, private to their account, editable any time.

**On the home page — a personalised welcome card** shown to signed-in users who filled this in:
- A short warm line written for them, e.g. "Long day at the office? Let's clear your head for five minutes before the next task."
- A suggested next step: a mood chip pre-selected, the matching ambient sound started, and one suggested action ("Start a 2-minute breath")
- A gentle "Update how you're feeling" link back to the profile

**In the chat** — the coach knows their situation, so replies reference their role and goal without them repeating it each time.

## Behaviour details

- Signed-out or empty profile: home page looks exactly as it does today, plus a soft invite to personalise.
- The personalised line is generated once and stored, refreshed when they change their answers (not on every page load), so the page stays instant and costs nothing to revisit.
- The suggested mood/sound is derived from their answers, and they can still pick anything else freely.

## Technical notes

- Migration: add `role`, `primary_struggle`, `goal` (text), `condition_note` (text), `personalised_greeting` (text), `suggested_mood` (text), `personalised_at` (timestamptz) to `public.profiles`. Existing RLS already scopes rows to `auth.uid()`; no new grants needed.
- `src/lib/personalisation.functions.ts`: a `createServerFn` with `requireSupabaseAuth` that validates input with zod, saves the answers, calls the Lovable AI gateway for a 1–2 sentence greeting plus a suggested mood id (strict schema, values constrained to existing `MoodId`s), and stores the result. Non-streaming one-shot on `google/gemini-3.6-flash`, matching the chat route's model; gateway failures fall back to a rule-based greeting so saving never fails.
- Profile page: new card with the guided selects/chips + textarea, zod-validated client-side, invalidates the `["profile", userId]` query on save.
- Home page: `src/components/sanctuary/personal-card.tsx` reads the profile via `useSession` + `useQuery` (client-only, no protected loader on the public route), renders the greeting, and on mount applies `suggested_mood` to the existing mood/track state without auto-playing audio until the user taps.
- `src/routes/api/chat.ts`: accept an optional `profile` context object in the POST body and append it to the system prompt alongside the existing mood line; the client sends it from `prepareSendMessagesRequest` in `coach-chat.tsx`.
