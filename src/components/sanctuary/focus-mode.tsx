import { useEffect, useState } from "react";
import { BellOff, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Device = "iphone" | "android" | "windows" | "mac" | "other";

const GUIDES: Record<Device, { name: string; steps: string[] }> = {
  iphone: {
    name: "iPhone / iPad",
    steps: [
      "Swipe down from the top-right corner to open Control Centre.",
      "Tap Focus, then Do Not Disturb.",
      "To allow calls: Settings → Focus → Do Not Disturb → People → Calls From → Everybody.",
    ],
  },
  android: {
    name: "Android",
    steps: [
      "Swipe down twice from the top of the screen.",
      "Tap Do Not Disturb.",
      "To allow calls: Settings → Notifications → Do Not Disturb → People → Calls → Anyone.",
    ],
  },
  windows: {
    name: "Windows",
    steps: [
      "Open Settings → System → Notifications.",
      "Turn on Do Not Disturb.",
      "Under priority notifications, keep calls allowed.",
    ],
  },
  mac: {
    name: "Mac",
    steps: [
      "Click Control Centre in the menu bar.",
      "Click Focus, then Do Not Disturb.",
      "System Settings → Focus → Do Not Disturb → Allowed People to keep calls.",
    ],
  },
  other: {
    name: "your device",
    steps: [
      "Open your device's quick settings.",
      "Turn on Do Not Disturb or Focus mode.",
      "Allow calls in its settings so important calls still ring.",
    ],
  },
};

function detectDevice(): Device {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "iphone";
  if (/Android/i.test(ua)) return "android";
  if (/Windows/i.test(ua)) return "windows";
  if (/Macintosh/i.test(ua)) return "mac";
  return "other";
}

export function FocusConsent({
  open,
  onAccept,
  onDecline,
}: {
  open: boolean;
  onAccept: (remember: boolean) => void;
  onDecline: (remember: boolean) => void;
}) {
  const [remember, setRemember] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onDecline(remember)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Shall we protect this calm time?</DialogTitle>
          <DialogDescription>
            Velora will go quiet, open full screen, keep your screen awake and help you silence
            other notifications. Calls can still come through.
          </DialogDescription>
        </DialogHeader>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
          Remember my choice on this device
        </label>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onDecline(remember)}>
            Not now
          </Button>
          <Button onClick={() => onAccept(remember)}>
            <BellOff className="mr-2 h-4 w-4" /> Yes, focus mode
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FocusGuide({ open, onDone }: { open: boolean; onDone: () => void }) {
  const [device, setDevice] = useState<Device>("other");
  useEffect(() => setDevice(detectDevice()), []);
  const guide = GUIDES[device];
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onDone()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Silence other notifications</DialogTitle>
          <DialogDescription>
            Websites can't change this for you, so here's how on {guide.name}. Calls stay on.
          </DialogDescription>
        </DialogHeader>
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          {guide.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <DialogFooter>
          <Button onClick={onDone}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FocusBadge({ onEnd }: { onEnd: () => void }) {
  return (
    <div className="glass fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border px-4 py-2 text-sm shadow-[var(--shadow-lift)]">
      <BellOff className="h-4 w-4 text-primary" />
      <span>Focus mode on</span>
      <Phone className="h-3.5 w-3.5 text-muted-foreground" aria-label="Calls allowed" />
      <Button size="sm" variant="ghost" onClick={onEnd}>
        End focus
      </Button>
    </div>
  );
}
