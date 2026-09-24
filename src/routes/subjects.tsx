import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Atom, FlaskConical, Sigma, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { useStudy, addChapter, toggleChapter, deleteChapter, SUBJECTS, type SubjectId } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects — StudyFlow" },
      { name: "description", content: "Manage chapters for Physics, Chemistry and Math." },
      { property: "og:title", content: "Subjects — StudyFlow" },
      { property: "og:description", content: "Manage chapters for Physics, Chemistry and Math." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubjectsPage,
});

const ICONS = { atom: Atom, flask: FlaskConical, sigma: Sigma } as const;

function SubjectsPage() {
  const study = useStudy();
  const [active, setActive] = useState<SubjectId>("physics");
  const [title, setTitle] = useState("");

  const chapters = study.chapters.filter((c) => c.subject === active);
  const doneCount = chapters.filter((c) => c.done).length;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addChapter(active, title);
    setTitle("");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">Subjects</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Add chapters to each subject and check them off as you study.
      </p>

      {/* Subject tabs */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {SUBJECTS.map((s) => {
          const Icon = ICONS[s.icon as keyof typeof ICONS];
          const subj = study.chapters.filter((c) => c.subject === s.id);
          const done = subj.filter((c) => c.done).length;
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all md:p-5",
                isActive
                  ? "border-transparent bg-forest-deep text-primary-foreground shadow-md"
                  : "card-soft hover:border-primary/40",
              )}
            >
              <Icon className={cn("size-6", isActive ? "text-mint" : "text-primary")} />
              <p className="mt-2 font-display text-sm font-semibold md:text-base">{s.name}</p>
              <p className={cn("mt-0.5 text-xs", isActive ? "opacity-75" : "text-muted-foreground")}>
                {done}/{subj.length} done
              </p>
            </button>
          );
        })}
      </div>

      {/* Add chapter */}
      <form onSubmit={submit} className="card-soft mt-6 flex gap-3 p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Add a ${SUBJECTS.find((s) => s.id === active)?.name} chapter…`}
          className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" /> Add
        </button>
      </form>

      {/* Chapter list */}
      <div className="card-soft mt-4 p-4 md:p-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="font-display text-lg font-semibold">
            {SUBJECTS.find((s) => s.id === active)?.name} Chapters
          </h2>
          <span className="text-xs font-medium text-muted-foreground">
            {doneCount} of {chapters.length} completed
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {chapters.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No chapters yet — add your first one above.
            </p>
          )}
          {chapters.map((c) => (
            <div
              key={c.id}
              className="group flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-accent/50"
            >
              <button
                onClick={() => toggleChapter(c.id)}
                aria-label={c.done ? "Mark as not completed" : "Mark as completed"}
                className="shrink-0"
              >
                {c.done ? (
                  <CheckCircle2 className="size-6 text-primary" />
                ) : (
                  <Circle className="size-6 text-muted-foreground transition-colors group-hover:text-primary" />
                )}
              </button>
              <p className={cn("flex-1 text-sm font-medium", c.done && "text-muted-foreground line-through")}>
                {c.title}
              </p>
              <button
                onClick={() => deleteChapter(c.id)}
                aria-label="Delete chapter"
                className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
