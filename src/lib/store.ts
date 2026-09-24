import { useSyncExternalStore } from "react";

export type SubjectId = "physics" | "chemistry" | "math";

export interface Chapter {
  id: string;
  subject: SubjectId;
  title: string;
  done: boolean;
  createdAt: number;
  completedAt?: number | undefined;
}

export interface StudyState {
  chapters: Chapter[];
  focusMinutesTotal: number;
  activeDays: string[]; // ISO date strings (yyyy-mm-dd) with any activity
}

const KEY = "study-planner-v1";

const seed: StudyState = {
  chapters: [
    { id: "s1", subject: "physics", title: "Kinematics", done: true, createdAt: 1, completedAt: Date.now() },
    { id: "s2", subject: "physics", title: "Laws of Motion", done: false, createdAt: 2 },
    { id: "s3", subject: "chemistry", title: "Atomic Structure", done: true, createdAt: 3, completedAt: Date.now() },
    { id: "s4", subject: "chemistry", title: "Chemical Bonding", done: false, createdAt: 4 },
    { id: "s5", subject: "math", title: "Quadratic Equations", done: false, createdAt: 5 },
    { id: "s6", subject: "math", title: "Trigonometry", done: true, createdAt: 6, completedAt: Date.now() },
  ],
  focusMinutesTotal: 0,
  activeDays: [],
};

let state: StudyState = load();
const listeners = new Set<() => void>();

function load(): StudyState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as StudyState;
  } catch {
    /* ignore */
  }
  return seed;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function setState(next: StudyState) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

export function useStudy(): StudyState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => seed,
  );
}

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function markActive(s: StudyState): StudyState {
  const t = todayKey();
  return s.activeDays.includes(t) ? s : { ...s, activeDays: [...s.activeDays, t] };
}

export function addChapter(subject: SubjectId, title: string) {
  const ch: Chapter = {
    id: crypto.randomUUID(),
    subject,
    title: title.trim(),
    done: false,
    createdAt: Date.now(),
  };
  setState(markActive({ ...state, chapters: [...state.chapters, ch] }));
}

export function toggleChapter(id: string) {
  setState(
    markActive({
      ...state,
      chapters: state.chapters.map((c) =>
        c.id === id
          ? { ...c, done: !c.done, completedAt: !c.done ? Date.now() : undefined }
          : c,
      ),
    }),
  );
}

export function deleteChapter(id: string) {
  setState({ ...state, chapters: state.chapters.filter((c) => c.id !== id) });
}

export function addFocusMinutes(min: number) {
  setState(markActive({ ...state, focusMinutesTotal: state.focusMinutesTotal + min }));
}

export function streakDays(s: StudyState): number {
  const days = new Set(s.activeDays);
  let streak = 0;
  const d = new Date();
  // if today has no activity yet, count from yesterday
  if (!days.has(todayKey(d))) d.setDate(d.getDate() - 1);
  while (days.has(todayKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export const SUBJECTS: { id: SubjectId; name: string; icon: string }[] = [
  { id: "physics", name: "Physics", icon: "atom" },
  { id: "chemistry", name: "Chemistry", icon: "flask" },
  { id: "math", name: "Math", icon: "sigma" },
];
