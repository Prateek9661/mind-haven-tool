# Moving water for Calm

## Experience
- When someone has saved **Calm** as their goal, replace the still water image in the welcome area with a realistic, slow-moving water scene that loops gently. Keep the greeting and affirmation clear and readable over it. The rest of the Calm palette remains in place; other goals and signed-out visitors keep their current appearance.
- Add a small, clearly labelled water-sound control in the welcome area with play/pause and volume. Use a natural-sounding, continuous water ambience and a gentle fade when starting or stopping. Keep it separate from the existing soundscape player so the two never unexpectedly play over one another.
- Start the motion on arrival, but **do not force audio to play before interaction**: browsers block sound autoplay. Show an inviting “Play water sound” control immediately; once tapped, the water sound begins. If the person starts another ambient sound, stop the water sound, and vice versa. Remember the sound preference locally so a return visit can resume after the first permitted interaction.
- Respect reduced-motion preferences with the existing still water view instead of looping video. Offer a visible motion pause control for everyone, and pause video when offscreen or the tab is hidden.

## Technical notes
- Create or source a short, locally served water video and a locally served water-audio loop; avoid external streaming dependencies and keep files reasonably small. Use a poster image for loading, reduced motion, and playback failure.
- Keep media state coordinated on the sanctuary page and pass controls to the welcome area and existing sound player. Clean up media and listeners on exit.
- Verify Calm and non-Calm states on desktop and mobile, media playback controls, sound handoff, reduced motion, and readable text.
