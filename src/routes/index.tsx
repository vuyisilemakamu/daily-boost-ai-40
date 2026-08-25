import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  CalendarCheck,
  CheckCircle2,
  AlarmClock,
  ListTodo,
  CalendarClock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks } from "@/lib/use-tasks";
import { countdownLabel, dayDiff, isOverdue, isToday, sortForPlanning } from "@/lib/planner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Workflow AI Productivity Assistant" },
      {
        name: "description",
        content:
          "See today's tasks, overdue work, upcoming deadlines and jump straight into the AI email, notes and planning tools.",
      },
      { property: "og:title", content: "Dashboard — Workflow AI" },
      {
        property: "og:description",
        content: "Today's tasks, deadlines and AI tools in one clean dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    text: "Describe the message — get a subject line and polished body, or rewrite an existing draft.",
  },
  {
    to: "/notes",
    icon: FileText,
    title: "AI Notes Summarizer",
    text: "Paste meeting notes and pull out decisions, action items and deadlines.",
  },
  {
    to: "/tasks",
    icon: CalendarCheck,
    title: "Task Planner & Scheduler",
    text: "Auto-broken-down tasks, an optimised day timeline and a full week plan.",
  },
] as const;

function Dashboard() {
  const { tasks, loaded, toggleTask } = useTasks();

  const open = tasks.filter((t) => !t.done);
  const todays = open.filter(isToday);
  const overdue = open.filter(isOverdue);
  const upcoming = sortForPlanning(open.filter((t) => dayDiff(t.deadline) > 0)).slice(0, 5);
  const completed = tasks.filter((t) => t.done).slice(0, 4);

  const stats = [
    { label: "Due today", value: todays.length, icon: ListTodo, tone: "text-primary" },
    { label: "Overdue", value: overdue.length, icon: AlarmClock, tone: "text-destructive" },
    { label: "Upcoming", value: open.length - todays.length - overdue.length, icon: CalendarClock, tone: "text-chart-2" },
    { label: "Completed", value: tasks.filter((t) => t.done).length, icon: CheckCircle2, tone: "text-success" },
  ];

  return (
    <AppLayout title="Dashboard" description="Your workday, summarised">
      <div className="space-y-6">
        <section className="hero-gradient animate-rise overflow-hidden rounded-2xl px-6 py-8 text-primary-foreground shadow-[var(--shadow-glow)] sm:px-9 sm:py-10">
          <Badge className="mb-4 border-0 bg-white/15 text-primary-foreground hover:bg-white/15">
            <Sparkles className="size-3" /> No sign-in required
          </Badge>
          <h2 className="max-w-2xl text-2xl font-semibold sm:text-3xl">
            Good day. Let's clear the noise and get the important work done.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-primary-foreground/85">
            Draft the email, summarise the meeting, plan the day — three AI tools sharing one
            workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link to="/email">
                <Mail className="size-4" /> Write an email
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/notes">
                <FileText className="size-4" /> Summarise notes
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/tasks">
                <CalendarCheck className="size-4" /> Plan my day
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card-surface animate-rise p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className={cn("size-4", s.tone)} />
              </div>
              {loaded ? (
                <p className="mt-2 text-3xl font-semibold tabular-nums">{s.value}</p>
              ) : (
                <Skeleton className="mt-3 h-8 w-12" />
              )}
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="card-surface animate-rise group p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <tool.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{tool.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tool.text}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="card-surface p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Today's tasks</h3>
              <Button asChild variant="ghost" size="sm">
                <Link to="/tasks">View all</Link>
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {!loaded && <Skeleton className="h-16 w-full" />}
              {loaded && todays.length === 0 && overdue.length === 0 && (
                <p className="py-6 text-sm text-muted-foreground">
                  Nothing scheduled for today. Enjoy the quiet.
                </p>
              )}
              {[...overdue, ...todays].map((t) => (
                <label
                  key={t.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border-l-4 bg-muted/40 px-3 py-2.5 transition-colors hover:bg-muted",
                    isOverdue(t) ? "border-l-destructive" : "border-l-primary",
                  )}
                >
                  <Checkbox checked={t.done} onCheckedChange={() => toggleTask(t.id)} className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{t.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {countdownLabel(t.deadline)} · {t.duration} min ·{" "}
                      {t.steps.filter((s) => s.done).length}/{t.steps.length} steps
                    </span>
                  </span>
                  <Badge variant={isOverdue(t) ? "destructive" : "secondary"}>{t.priority}</Badge>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-surface p-5">
              <h3 className="font-semibold">Upcoming deadlines</h3>
              <div className="mt-3 space-y-2">
                {!loaded && <Skeleton className="h-16 w-full" />}
                {loaded && upcoming.length === 0 && (
                  <p className="py-4 text-sm text-muted-foreground">No upcoming deadlines.</p>
                )}
                {upcoming.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2.5"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{t.name}</span>
                    <Badge variant={dayDiff(t.deadline) <= 2 ? "default" : "outline"}>
                      {countdownLabel(t.deadline)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-surface p-5">
              <h3 className="font-semibold">Recently completed</h3>
              <div className="mt-3 space-y-2">
                {loaded && completed.length === 0 && (
                  <p className="py-4 text-sm text-muted-foreground">Nothing completed yet today.</p>
                )}
                {completed.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                    <span className="truncate line-through">{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
