import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <main className="sanctuary-bg flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Just a moment…</p>
      </main>
    );
  }

  return <Outlet />;
}
