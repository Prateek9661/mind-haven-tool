# Motivation-only visual theme

## Goal
Give signed-in people who select **Motivation** a distinct, energizing Velora experience. The new visuals and wording will appear only when the saved profile goal is Motivation; signed-out visitors and every other goal keep their current presentation, including the existing Calm water experience.

## Experience
- Introduce a page-wide Motivation theme using electric indigo and deep violet for focused authority, vibrant teal and aqua for fresh momentum, and warm amber and sunrise gold for morning energy.
- Preserve Velora’s elegant serif typography, soft surfaces, and premium restraint. The result will feel alert and encouraging, not loud, aggressive, neon, or gamified.
- Transform the welcome area into a subtle sunrise-inspired visual: moving warm light, restrained rising lines, and teal highlights that suggest forward progress.
- Use Motivation-specific welcome copy and affirmations centered on one achievable next step, gentle momentum, and self-belief rather than pressure or hustle culture.
- Add a visible motion pause control and provide a still version for people who prefer reduced motion.
- Carry the Motivation palette through cards, borders, controls, and highlighted recommendations so the whole sanctuary feels personally selected rather than changing only one banner.

## Personalization rules
- Activate the theme only when the saved goal equals **Motivation**.
- Keep the existing motivation session, Lofi recommendation, section ordering, coach personalization, and check-in flow working within the new visual treatment.
- Do not alter Calm, Focus for work, Better sleep, Confidence, account pages, or the signed-out experience.
- When a person changes their saved goal away from Motivation, remove the theme automatically on their next visit or redirect back to the sanctuary.

## Technical details
- Derive a `motivating` state from the profile already loaded on the home page and scope all new theme tokens beneath a home-page-only Motivation class.
- Extend the welcome component with a Motivation presentation alongside its current default and Calm variants.
- Build decorative motion with lightweight CSS and semantic color tokens; no new database fields or external services are needed.
- Ensure strong text contrast, responsive layout, no overflow, and `prefers-reduced-motion` support.
- Verify Motivation on desktop and mobile, then verify Calm and a non-Motivation goal remain visually unchanged.
