# Focus visuals — Quiet workspace

## Experience
- Give users whose saved goal is **Focus for work** a dedicated quiet-workspace appearance on the home page only.
- Create a realistic image of a tidy desk in soft daylight, with an open notebook and an uncluttered setting. Place it behind the welcome text with enough contrast to keep both the scene and words clear.
- Use a restrained mix of cool teal, midnight ink, and soft daylight tones, preserving Velora’s existing serif headings and gentle styling.
- Show a focus-specific greeting and short supportive thoughts about working on one manageable task at a time, with a refresh control.
- Add very subtle daylight movement with a pause/resume control; show a still scene for people who prefer reduced motion.
- Carry selective focus colors into the existing home-page controls and cards without changing their layout or behavior.

## Boundaries
- Activate this appearance only for the saved **Focus for work** goal—not merely a temporary mood selection.
- Keep Calm, Motivation, all other goals, signed-out visitors, and account pages unchanged.
- No new audio, timers, profile questions, permissions, AI calls, or changes to session recommendations.
- No promises of improved productivity or medical benefits.

## Technical details
- Add a home-page `focus-mode` theme scope driven by `profile?.goal === "Focus for work"`, with semantic color tokens in the global stylesheet.
- Extend the welcome banner with a focus-specific visual branch and curated focus thoughts. Keep imagery bundled as a local project asset.
- Ensure quote cycling follows the active goal, including after changing the saved profile choice.
- Keep decorative imagery out of the accessibility reading order and provide accessible names for motion controls.

## Verification
- Save **Focus for work** through the profile and confirm the workspace scene appears after returning home.
- Check the image, text, controls, and spacing on mobile and desktop; confirm no horizontal overflow.
- Verify thought refresh, motion pause/resume, and reduced-motion behavior.
- Switch to Calm, Motivation, and another goal to confirm each retains its own appearance; restore the original saved choice afterward.
- Confirm account pages remain unchanged and check for browser and compilation errors.