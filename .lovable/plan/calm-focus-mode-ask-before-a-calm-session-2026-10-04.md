# Calm Focus Mode (ask before a Calm session)

## Important limitation
A website cannot switch off your phone's or computer's notifications, and it cannot let only calls through. Only the device itself can do that, using its own Do Not Disturb or Focus setting. So Velora will ask for your permission, do everything a website is allowed to do, and walk you through turning on Do Not Disturb with calls allowed, in one tap-friendly step.

## What the user sees
1. When someone with the Calm goal starts a session, guided exercise, or water sound, a gentle prompt appears: "Shall we protect this calm time? Velora will go quiet and help you silence other notifications. Calls can still come through."
   - Buttons: "Yes, focus mode" / "Not now". A "Don't ask again" option is stored on this device.
2. If they agree, Velora:
   - Opens the session full screen to cut out other tabs and visual noise.
   - Keeps the screen from dimming or locking during the session.
   - Mutes Velora's own pop-up messages until the session ends.
   - Shows a short card with steps for their device (iPhone, Android, Windows, Mac) to turn on Do Not Disturb / Focus and allow calls only. It guesses the device automatically, with a "Done" button.
3. A small "Focus mode on" badge shows during the session, with an "End focus" button.
4. Focus mode ends on its own when the session finishes or the feeling check-in appears, and the device reminder says "You can turn Do Not Disturb off now."

Other goals and signed-out visitors see no change.

## Technical details
- New `src/components/sanctuary/focus-mode.tsx`: consent dialog, device-specific DND guide (detected from user agent), active badge.
- New `src/hooks/use-focus-mode.ts`: `start()` calls `document.documentElement.requestFullscreen()` and `navigator.wakeLock.request("screen")` (both feature-checked, failures ignored silently), sets a `quiet` flag; `stop()` releases both. Re-acquires wake lock on `visibilitychange`.
- Sonner toasts suppressed while `quiet` is true (wrapper helper used by the home page).
- `src/routes/index.tsx`: when `relaxing`, `startSession`, exercise begin and water play first open the consent dialog (unless stored preference in localStorage `velora-focus-pref`); `completeExercise` / feedback shown calls `stop()`.
- No database changes, no new permissions requested from the browser beyond fullscreen/wake lock (neither shows a permission popup).
