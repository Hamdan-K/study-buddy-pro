import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  BookOpen,
  ListChecks,
  Timer,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutGrid },
  { title: "Subjects", url: "/subjects", icon: BookOpen },
  { title: "Tasks", url: "/tasks", icon: ListChecks },
  { title: "Focus Timer", url: "/focus", icon: Timer },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6">
      <Link to="/" className="mb-8 flex items-center gap-2.5 px-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="size-5" />
        </span>
        <span className="font-display text-lg font-bold tracking-tight text-foreground">
          StudyFlow
        </span>
      </Link>

      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Menu
      </p>
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = currentPath === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-forest-deep p-4 text-primary-foreground">
        <p className="font-display text-sm font-semibold">Stay consistent</p>
        <p className="mt-1 text-xs opacity-80">
          Small daily wins compound into big results.
        </p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-card py-2 md:hidden">
      {items.map((item) => {
        const active = currentPath === item.url;
        return (
          <Link
            key={item.url}
            to={item.url}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-medium",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="size-5" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
