import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { FEELING_SCORE, useCheckins, type Checkin } from "@/hooks/use-checkins";

const LABELS: Record<number, string> = { 1: "Heavy", 2: "Steady", 3: "Lighter" };

function formatHour(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function dayKey(value: string) {
  return new Date(value).toDateString();
}

export function MoodChart() {
  const { user, checkins, loading } = useCheckins();

  const today = useMemo(() => {
    const key = new Date().toDateString();
    return checkins
      .filter((c) => dayKey(c.created_at) === key)
      .map((c) => ({ label: formatHour(c.created_at), score: FEELING_SCORE[c.feeling] }));
  }, [checkins]);

  const week = useMemo(() => {
    const days: { label: string; score: number | null }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toDateString();
      const rows: Checkin[] = checkins.filter((c) => dayKey(c.created_at) === key);
      const score = rows.length
        ? rows.reduce((sum, c) => sum + FEELING_SCORE[c.feeling], 0) / rows.length
        : null;
      days.push({
        label: date.toLocaleDateString([], { weekday: "short" }),
        score: score === null ? null : Math.round(score * 10) / 10,
      });
    }
    return days;
  }, [checkins]);

  if (!user || loading) return null;

  return (
    <section className="glass-card animate-float-up px-6 py-7 sm:px-9" aria-label="How your day is going">
      <div className="text-center">
        <h2 className="font-display text-2xl font-light text-foreground">How your day is going</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Built only from your own check-ins, after each session.
        </p>
      </div>

      {checkins.length === 0 ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Finish a session and tell Velora how you feel — your chart starts there.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          <div>
            <p className="text-sm font-medium text-primary">Today, moment by moment</p>
            {today.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No check-ins yet today.</p>
            ) : (
              <div className="mt-3 h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={today} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis
                      domain={[1, 3]}
                      ticks={[1, 2, 3]}
                      tickFormatter={(v: number) => LABELS[v] ?? ""}
                      tick={{ fontSize: 12 }}
                      width={70}
                      stroke="var(--muted-foreground)"
                    />
                    <Tooltip
                      formatter={(value: number) => [LABELS[Math.round(value)] ?? value, "You felt"]}
                      contentStyle={{
                        borderRadius: 16,
                        border: "1px solid var(--border)",
                        background: "var(--card)",
                        color: "var(--foreground)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "var(--primary)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-primary">This week</p>
            <div className="mt-3 h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={week} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis
                    domain={[1, 3]}
                    ticks={[1, 2, 3]}
                    tickFormatter={(v: number) => LABELS[v] ?? ""}
                    tick={{ fontSize: 12 }}
                    width={70}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toFixed(1), "Average"]}
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--foreground)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    connectNulls
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--primary)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
