import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Flame,
  CheckCircle2,
  Circle,
  Timer,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import {
  useStudy,
  streakDays,
  SUBJECTS,
  todayKey,
} from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — StudyFlow" },
      { name: "description", content: "Your daily study overview: progress, streak, next task and focus time." },
      { property: "og:title", content: "Dashboard — StudyFlow" },
      { property: "og:description", content: "Your daily study overview: progress, streak, next task and focus time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function greeting(h: number) {
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const study = useStudy();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const total = study.chapters.length;
  const done = study.chapters.filter((c) => c.done).length;
  const pending = total - done;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const streak = streakDays(study);
  const nextTask = study.chapters.find((c) => !c.done);
  const todayDone = study.chapters.filter(
    (c) => c.done && c.completedAt && todayKey(new Date(c.completedAt)) === todayKey(),
  ).length;

  const timeStr = now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--";
  const dateStr = now ? now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }) : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{dateStr}</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
            {greeting(now ? now.getHours() : new Date().getHours())}, Scholar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan, prioritize, and accomplish your study goals with ease.
          </p>
        </div>
        <div className="card-soft flex items-center gap-3 px-5 py-3">
          <Timer className="size-5 text-primary" />
          <span className="font-display text-2xl font-bold tabular-nums tracking-tight">
            {timeStr}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-forest-deep p-5 text-primary-foreground">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium opacity-90">Total Chapters</p>
            <Link to="/subjects" className="rounded-full bg-white/15 p-1.5">
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <p className="mt-3 font-display text-4xl font-bold">{total}</p>
          <p className="mt-2 flex items-center gap-1.5 text-xs opacity-80">
            <BookOpen className="size-3.5" /> Across {SUBJECTS.length} subjects
          </p>
        </div>

        <StatCard label="Completed" value={done} sub="Chapters done" to="/tasks" />
        <StatCard label="Pending" value={pending} sub="Still to study" to="/tasks" />
        <div className="card-soft p-5">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-muted-foreground">Study Streak</p>
            <span className="rounded-full bg-accent p-1.5 text-accent-foreground">
              <Flame className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-4xl font-bold">
            {streak}
            <span className="ml-1 text-base font-medium text-muted-foreground">
              {streak === 1 ? "day" : "days"}
            </span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Keep the flame alive</p>
        </div>
      </div>

      {/* Middle row */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Daily progress */}
        <div className="card-soft p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Daily Progress</h2>
            <TrendingUp className="size-5 text-primary" />
          </div>
          <div className="mt-6 flex items-center justify-center">
            <ProgressRing pct={pct} />
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {done} of {total} chapters completed
          </p>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            {todayDone} completed today
          </p>
        </div>

        {/* Next task */}
        <div className="card-soft flex flex-col p-6">
          <h2 className="font-display text-lg font-semibold">Next Task</h2>
          {nextTask ? (
            <>
              <div className="mt-4 flex-1">
                <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  {SUBJECTS.find((s) => s.id === nextTask.subject)?.name}
                </span>
                <p className="mt-3 font-display text-2xl font-bold leading-snug">
                  {nextTask.title}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Up next in your queue — dive in while you're fresh.
                </p>
              </div>
              <Link
                to="/focus"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Timer className="size-4" /> Start Focus Session
              </Link>
            </>
          ) : (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center text-center">
              <CheckCircle2 className="size-10 text-primary" />
              <p className="mt-3 font-display text-lg font-semibold">All caught up!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add new chapters to keep learning.
              </p>
              <Link
                to="/subjects"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Add Chapters
              </Link>
            </div>
          )}
        </div>

        {/* Focus summary */}
        <div className="relative overflow-hidden rounded-2xl bg-forest-deep p-6 text-primary-foreground">
          <h2 className="font-display text-lg font-semibold">Focus Time</h2>
          <p className="mt-6 font-display text-5xl font-bold tabular-nums">
            {Math.floor(study.focusMinutesTotal / 60)}
            <span className="text-xl font-medium opacity-70">h </span>
            {study.focusMinutesTotal % 60}
            <span className="text-xl font-medium opacity-70">m</span>
          </p>
          <p className="mt-2 text-sm opacity-80">Total focused study time</p>
          <Link
            to="/focus"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/25"
          >
            <Timer className="size-4" /> Open Focus Timer
          </Link>
        </div>
      </div>

      {/* Task list */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TaskColumn title="Not Completed" chapters={study.chapters.filter((c) => !c.done)} empty="Nothing pending — nice work!" />
        <TaskColumn title="Completed" chapters={study.chapters.filter((c) => c.done)} empty="No completed chapters yet." doneList />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, to }: { label: string; value: number; sub: string; to: string }) {
  return (
    <div className="card-soft p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Link to={to} className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent">
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <p className="mt-3 font-display text-4xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-36">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="12" className="stroke-muted" />
        <circle
          cx="60" cy="60" r={r} fill="none" strokeWidth="12" strokeLinecap="round"
          className="stroke-primary transition-all duration-700"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold">{pct}%</span>
        <span className="text-xs text-muted-foreground">done</span>
      </div>
    </div>
  );
}

function TaskColumn({ title, chapters, empty, doneList }: { title: string; chapters: { id: string; title: string; subject: string }[]; empty: string; doneList?: boolean }) {
  return (
    <div className="card-soft p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-4 flex flex-col gap-2">
        {chapters.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>
        )}
        {chapters.slice(0, 6).map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
            {doneList ? (
              <CheckCircle2 className="size-5 shrink-0 text-primary" />
            ) : (
              <Circle className="size-5 shrink-0 text-muted-foreground" />
            )}
            <div className="min-w-0">
              <p className={`truncate text-sm font-medium ${doneList ? "text-muted-foreground line-through" : ""}`}>
                {c.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {SUBJECTS.find((s) => s.id === c.subject)?.name}
              </p>
            </div>
          </div>
        ))}
        {chapters.length > 6 && (
          <Link to="/tasks" className="mt-1 text-center text-xs font-medium text-primary hover:underline">
            View all {chapters.length} →
          </Link>
        )}
      </div>
    </div>
  );
}
