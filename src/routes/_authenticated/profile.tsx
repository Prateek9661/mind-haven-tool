import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Camera, LogOut } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";
import { savePersonalContext } from "@/lib/personalisation.functions";
import { ROLE_OPTIONS, STRUGGLE_OPTIONS, GOAL_OPTIONS } from "@/lib/personalisation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your Velora Profile — Name, Work, Age & Country" },
      {
        name: "description",
        content:
          "Save your name, occupation, age, country and profile photo so Velora feels like your own quiet corner.",
      },
      { property: "og:title", content: "Your Velora Profile" },
      {
        property: "og:description",
        content: "Keep your name, occupation, age, country and photo in your Velora sanctuary.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const profileSchema = z.object({
  full_name: z.string().trim().max(80, "Name must be under 80 characters"),
  occupation: z.string().trim().max(80, "Occupation must be under 80 characters"),
  age: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{1,3}$/.test(v) && Number(v) >= 13 && Number(v) <= 120), {
      message: "Age must be a number between 13 and 120",
    }),
  country: z.string().trim().max(60, "Country must be under 60 characters"),
});

function ProfilePage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({ full_name: "", occupation: "", age: "", country: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, occupation, age, country, avatar_path")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      occupation: profile.occupation ?? "",
      age: profile.age != null ? String(profile.age) : "",
      country: profile.country ?? "",
    });
  }, [profile]);

  useEffect(() => {
    let active = true;
    const path = profile?.avatar_path;
    if (!path) {
      setAvatarUrl(null);
      return;
    }
    void supabase.storage
      .from("avatars")
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (active) setAvatarUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [profile?.avatar_path]);

  const save = async () => {
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user!.id,
      full_name: parsed.data.full_name || null,
      occupation: parsed.data.occupation || null,
      age: parsed.data.age ? Number(parsed.data.age) : null,
      country: parsed.data.country || null,
    });
    setSaving(false);
    if (error) {
      toast.error("We couldn't save that just now. Please try again.");
      return;
    }
    toast.success("Your profile is saved.");
    void queryClient.invalidateQueries({ queryKey: ["profile", user!.id] });
  };

  const uploadAvatar = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please choose an image under 5 MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${user!.id}/avatar-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (uploadError) {
      setUploading(false);
      toast.error("The photo didn't upload. Please try again.");
      return;
    }
    const { error } = await supabase.from("profiles").upsert({ id: user!.id, avatar_path: path });
    setUploading(false);
    if (error) {
      toast.error("The photo didn't save. Please try again.");
      return;
    }
    toast.success("Profile photo updated.");
    void queryClient.invalidateQueries({ queryKey: ["profile", user!.id] });
  };

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  const initials = (form.full_name || user?.email || "V").slice(0, 1).toUpperCase();

  return (
    <main className="sanctuary-bg min-h-screen">
      <div className="mx-auto w-full max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="font-display text-base font-light uppercase tracking-[0.4em] text-primary"
          >
            Velora
          </Link>
          <Button variant="ghost" onClick={signOut} className="min-h-11 rounded-full">
            <LogOut className="size-4" aria-hidden />
            Sign out
          </Button>
        </div>

        <h1 className="mt-8 font-display text-3xl font-light text-foreground sm:text-4xl">
          Your profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A little about you, kept safe and private to your account.
        </p>

        <section className="glass-card mt-8 flex flex-col items-center gap-4 px-6 py-8">
          <Avatar className="size-24 border border-border">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="Your profile photo" /> : null}
            <AvatarFallback className="font-display text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadAvatar(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="min-h-11 rounded-full"
          >
            <Camera className="size-4" aria-hidden />
            {uploading ? "Uploading…" : "Change photo"}
          </Button>
        </section>

        <section className="glass-card mt-6 space-y-5 px-6 py-8 sm:px-8">
          <div className="space-y-2">
            <Label htmlFor="full_name">Name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              maxLength={80}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="min-h-11 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={form.occupation}
              maxLength={80}
              placeholder="Student, designer, nurse…"
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
              className="min-h-11 rounded-2xl"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                inputMode="numeric"
                value={form.age}
                maxLength={3}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="min-h-11 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                maxLength={60}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="min-h-11 rounded-2xl"
              />
            </div>
          </div>
          <Button onClick={save} disabled={saving} className="min-h-11 w-full rounded-full">
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </section>
      </div>
      <Toaster />
    </main>
  );
}
