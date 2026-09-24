import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { useStudy, toggleChapter, deleteChapter, SUBJECTS } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — StudyFlow" },
      { name: "description", content: "All completed and pending study tasks in one place." },
      { property: "og:title", content: "Tasks — StudyFlow" },
      { property: "og:description", content: "All completed and pending study tasks in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TasksPage,
});

type Filter = "all" | "pending" | "done";

function TasksPage() {
  const study = useStudy();
  const [filter, setFilter] = useState<Filter>("all");

  const chapters = study.chapters
    .slice()
    .sort((a, b) => Number(a.done) - Number(b.done) || b.createdAt - a.createdAt)
    .filter((c) => (filter === "all" ? true : filter === "done" ? c.done : !c.done));

  const done = study.chapters.filter((c) => c.done).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">Tasks</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {done} of {study.chapters.length} chapters completed.
      </p>

      <div className="mt-5 inline-flex rounded-xl border border-border bg-card p-1">
        {(["all", "pending", "done"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "done" ? "Completed" : f === "pending" ? "Not Completed" : "All"}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {chapters.length === 0 && (
          <div className="card-soft py-14 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </div>
        )}
        {chapters.map((c) => (
          <div
            key={c.id}
            className="card-soft group flex items-center gap-3 px-4 py-3.5"
          >
            <button onClick={() => toggleChapter(c.id)} className="shrink-0" aria-label="Toggle complete">
              {c.done ? (
                <CheckCircle2 className="size-6 text-primary" />
              ) : (
                <Circle className="size-6 text-muted-foreground transition-colors group-hover:text-primary" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-sm font-medium", c.done && "text-muted-foreground line-through")}>
                {c.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {SUBJECTS.find((s) => s.id === c.subject)?.name}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                c.done ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground",
              )}
            >
              {c.done ? "Completed" : "Pending"}
            </span>
            <button
              onClick={() => deleteChapter(c.id)}
              aria-label="Delete"
              className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
