import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Mail,
  FileText,
  CalendarCheck,
  Moon,
  Sun,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, blurb: "Your day at a glance" },
  { to: "/email", label: "Email Generator", icon: Mail, blurb: "Write or rewrite any email" },
  { to: "/notes", label: "Notes Summarizer", icon: FileText, blurb: "Turn notes into decisions" },
  { to: "/tasks", label: "Task Planner", icon: CalendarCheck, blurb: "Plan your day and week" },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("workflow-ai.theme");
    const isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("workflow-ai.theme", next ? "dark" : "light");
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode">
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

export function AppLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[16rem_1fr]">
      {open && (
        <button
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="hero-gradient flex size-9 items-center justify-center rounded-xl shadow-[var(--shadow-glow)]">
              <Sparkles className="size-4.5 text-primary-foreground" />
            </span>
            <span className="text-[0.95rem] leading-tight font-semibold text-sidebar-foreground">
              Workflow AI
              <span className="block text-[0.7rem] font-normal text-muted-foreground">
                Productivity assistant
              </span>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <item.icon
                  className={cn("mt-0.5 size-4 shrink-0", active && "text-sidebar-primary")}
                />
                <span>
                  {item.label}
                  <span className="block text-[0.7rem] font-normal text-muted-foreground">
                    {item.blurb}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <p className="px-5 py-5 text-[0.7rem] text-muted-foreground">
          No account needed — everything stays in your browser.
        </p>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
            <p className="truncate text-xs text-muted-foreground">{description}</p>
          </div>
          <ThemeToggle />
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
