import { Link } from "@tanstack/react-router";
import { UserRound } from "lucide-react";

import { useSession } from "@/hooks/use-session";

export function AccountNav() {
  const { user, loading } = useSession();

  return (
    <nav className="flex justify-end px-5 pt-6 sm:px-8" aria-label="Account">
      {loading ? null : (
        <Link
          to={user ? "/profile" : "/auth"}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-secondary/70 px-5 text-sm font-medium text-primary transition-colors hover:bg-accent"
        >
          <UserRound className="size-4" aria-hidden />
          {user ? "My profile" : "Sign in"}
        </Link>
      )}
    </nav>
  );
}
