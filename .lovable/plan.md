# Go straight to your sanctuary after saving

Right now, when you update how you're feeling on your profile page, you have to leave the profile yourself to see your refreshed sanctuary. This change takes you there automatically.

## What changes

- After you save the "About your mind" section (your role, what's weighing on you, your goal and your note), Velora shows the confirmation message and then moves you to the sanctuary home page on its own.
- Your refreshed session card, mood question and coach tone are already updated when you land there — no waiting, no stale content.
- The basic details save (name, occupation, age, photo) stays where it is: it confirms and keeps you on the profile so you can keep editing.

## Technical notes

- In `src/routes/_authenticated/profile.tsx`, `saveContext` already invalidates `["profile", userId]` and `["profile-context", userId]`. Await those invalidations so the home page renders fresh data, then call `navigate({ to: "/" })` on success only.
- Errors keep the user on the profile page with the existing error toast.
