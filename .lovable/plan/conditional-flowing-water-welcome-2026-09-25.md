# Conditional flowing-water welcome

## What will change
- Keep Velora’s welcome area exactly as it is by default.
- When a signed-in person has selected **Calm** as what they want from Velora, show a refined flowing-water treatment in the welcome area only.
- Preserve the existing Velora name, welcome wording, daily affirmation, and “Another gentle thought” action.

## Visual direction
- Add soft, layered ripples and reflected-light movement using Velora’s warm cream, champagne gold, muted water green, and midnight blue.
- Keep the motion slow and understated so the text remains easy to read and the rest of the sanctuary is unchanged.
- Adapt the composition for phone and desktop layouts.
- Respect reduced-motion preferences by showing a quiet still-water version instead of animated movement.

## Behaviour
- The home page will derive the treatment from the saved profile goal already loaded there.
- **Goal is Calm:** render the flowing-water welcome.
- **Any other goal, no goal, or signed out:** render the current welcome unchanged.
- Changing the saved goal and returning to the sanctuary will immediately switch the welcome treatment accordingly.

## Technical details
- Pass a simple relaxation flag from the home page into the welcome banner.
- Build the water layers with lightweight CSS shapes and animation; no new images, database fields, or services.
- Verify both conditional states and check the welcome area at mobile and desktop sizes.
