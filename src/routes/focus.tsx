import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { addFocusMinutes, useStudy } from "@/lib/store";
import { cn } from "@/lib/utils";
import focusBg from "@/assets/focus-bg.jpg";

export const Route = createFileRoute("/focus")({
  head: () => ({
    meta: [
      { title: "Focus Timer — StudyFlow" },
      { name: "description", content: "Pomodoro-style focus timer to power through your study sessions." },
      { property: "og:title", content: "Focus Timer — StudyFlow" },
      { property: "og:description", content: "Pomodoro-style focus timer to power through your study sessions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FocusPage,
});

const PRESETS = [
  { label: "15 min", mins: 15 },
  { label: "25 min", mins: 25 },
  { label: "45 min", mins: 45 },
  { label: "60 min", mins: 60 },
];

function FocusPage() {
  const study = useStudy();
  const [totalSecs, setTotalSecs] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const creditedRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  // credit completed focus minutes as time elapses
  useEffect(() => {
    const elapsed = totalSecs - remaining;
    const elapsedMin = Math.floor(elapsed / 60);
    if (elapsedMin > creditedRef.current) {
      addFocusMinutes(elapsedMin - creditedRef.current);
      creditedRef.current = elapsedMin;
    }
  }, [remaining, totalSecs]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const pct = totalSecs === 0 ? 0 : ((totalSecs - remaining) / totalSecs) * 100;

  function pick(mins: number) {
    setRunning(false);
    setTotalSecs(mins * 60);
    setRemaining(mins * 60);
    creditedRef.current = 0;
  }

  function reset() {
    setRunning(false);
    setRemaining(totalSecs);
    creditedRef.current = 0;
  }

  const r = 110;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <img
        src={focusBg}
        alt=""
        width={1280}
        height={800}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-forest-deep/60" />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center rounded-3xl border border-white/10 bg-black/30 p-8 text-primary-foreground backdrop-blur-md md:p-10">
        <h1 className="font-display text-2xl font-bold">Focus Timer</h1>
        <p className="mt-1 text-sm opacity-75">One chapter. One session. Full attention.</p>

        {/* Presets */}
        <div className="mt-6 flex gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.mins}
              onClick={() => pick(p.mins)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                totalSecs === p.mins * 60
                  ? "bg-primary-foreground text-forest-deep"
                  : "bg-white/10 hover:bg-white/20",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Ring */}
        <div className="relative mt-8 size-64">
          <svg viewBox="0 0 240 240" className="size-full -rotate-90">
            <circle cx="120" cy="120" r={r} fill="none" strokeWidth="10" className="stroke-white/15" />
            <circle
              cx="120" cy="120" r={r} fill="none" strokeWidth="10" strokeLinecap="round"
              className="stroke-mint transition-all duration-1000"
              strokeDasharray={c}
              strokeDashoffset={c - (pct / 100) * c}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-6xl font-bold tabular-nums tracking-tight">
              {mm}:{ss}
            </span>
            <span className="mt-1 text-xs uppercase tracking-widest opacity-70">
              {running ? "focusing" : remaining === 0 ? "done!" : "paused"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={reset}
            aria-label="Reset timer"
            className="rounded-full bg-white/10 p-3.5 transition-colors hover:bg-white/20"
          >
            <RotateCcw className="size-5" />
          </button>
          <button
            onClick={() => (remaining === 0 ? pick(totalSecs / 60) : setRunning((v) => !v))}
            aria-label={running ? "Pause" : "Start"}
            className="rounded-full bg-primary-foreground p-5 text-forest-deep shadow-lg transition-transform hover:scale-105"
          >
            {running ? <Pause className="size-7" /> : <Play className="size-7 translate-x-0.5" />}
          </button>
          <div className="w-12" />
        </div>

        <p className="mt-6 text-sm opacity-75">
          Lifetime focus: <span className="font-semibold">{Math.floor(study.focusMinutesTotal / 60)}h {study.focusMinutesTotal % 60}m</span>
        </p>
      </div>
    </div>
  );
}
