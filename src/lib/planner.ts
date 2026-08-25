import type { Priority, Step, Task } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 10);

const URGENT_WORDS = ["asap", "urgent", "immediately", "today", "critical", "emergency", "now"];
const HIGH_WORDS = ["important", "priority", "tomorrow", "deadline", "client", "board", "launch"];

/** Detect urgency from free-form wording. */
export function detectPriority(text: string, fallback: Priority = "medium"): Priority {
  const t = text.toLowerCase();
  if (URGENT_WORDS.some((w) => t.includes(w))) return "urgent";
  if (HIGH_WORDS.some((w) => t.includes(w))) return "high";
  return fallback;
}

type Template = { match: RegExp; steps: string[] };

const TEMPLATES: Template[] = [
  {
    match: /report|document|doc|write|draft|proposal|memo/,
    steps: [
      "Collect the source material and data",
      "Outline the structure and key messages",
      "Write the first draft",
      "Review, tighten and proofread",
      "Share for feedback and finalise",
    ],
  },
  {
    match: /present|slide|deck|pitch|demo/,
    steps: [
      "Define the audience and the takeaway",
      "Storyboard the slide flow",
      "Build the slides and visuals",
      "Rehearse and time the delivery",
    ],
  },
  {
    match: /meeting|call|sync|interview|1:1|workshop/,
    steps: [
      "Confirm attendees and send invites",
      "Prepare the agenda and materials",
      "Run the session and capture notes",
      "Send the recap and action items",
    ],
  },
  {
    match: /email|reply|respond|follow.?up|outreach/,
    steps: [
      "Re-read the thread and gather context",
      "Decide the ask and the tone",
      "Draft and send the message",
      "Set a reminder to follow up",
    ],
  },
  {
    match: /bug|fix|deploy|code|build|feature|api|test/,
    steps: [
      "Reproduce and scope the work",
      "Implement the change",
      "Test the happy path and edge cases",
      "Review, merge and deploy",
    ],
  },
  {
    match: /plan|strategy|budget|roadmap|research|analys/,
    steps: [
      "Clarify the goal and constraints",
      "Gather inputs and benchmarks",
      "Draft options with trade-offs",
      "Pick a direction and document it",
    ],
  },
];

/** Break a task into logical steps. */
export function generateSteps(name: string, description = ""): Step[] {
  const text = `${name} ${description}`.toLowerCase();
  const found = TEMPLATES.find((t) => t.match.test(text));
  const base =
    found?.steps ??
    [
      `Clarify what "done" means for ${name.trim() || "this task"}`,
      "Gather everything you need to start",
      "Do the main work in one focused block",
      "Check the result and wrap up",
    ];
  return base.map((text) => ({ id: uid(), text, done: false }));
}

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function dayDiff(dateISO: string): number {
  if (!dateISO) return 9999;
  const a = new Date(`${dateISO}T00:00:00`);
  const b = new Date(`${todayISO()}T00:00:00`);
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

export function countdownLabel(dateISO: string): string {
  const d = dayDiff(dateISO);
  if (!dateISO) return "No deadline";
  if (d < -1) return `${Math.abs(d)} days overdue`;
  if (d === -1) return "1 day overdue";
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  return `In ${d} days`;
}

export const isOverdue = (t: Task) => !t.done && !!t.deadline && dayDiff(t.deadline) < 0;
export const isToday = (t: Task) => !t.done && dayDiff(t.deadline) === 0;

const weight: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export function sortForPlanning(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const d = dayDiff(a.deadline) - dayDiff(b.deadline);
    if (d !== 0) return d;
    return weight[a.priority] - weight[b.priority];
  });
}

export type Slot = { start: string; end: string; task: Task; kind: "task" | "break" };

function fmt(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Build an optimised timeline for today, starting 9:00, with breaks. */
export function planMyDay(tasks: Task[]): Slot[] {
  const pool = sortForPlanning(
    tasks.filter((t) => !t.done && (!t.deadline || dayDiff(t.deadline) <= 1)),
  );
  const slots: Slot[] = [];
  let cursor = 9 * 60;
  for (const task of pool) {
    const dur = Math.max(15, Math.min(task.duration || 45, 180));
    if (cursor + dur > 18 * 60) break;
    slots.push({ start: fmt(cursor), end: fmt(cursor + dur), task, kind: "task" });
    cursor += dur;
    if (cursor < 18 * 60) {
      slots.push({ start: fmt(cursor), end: fmt(cursor + 15), task, kind: "break" });
      cursor += 15;
    }
  }
  return slots;
}

export type WeekDay = { date: Date; tasks: Task[]; minutes: number };

/** Distribute open tasks over the next 7 days, respecting deadlines and ~4h/day. */
export function planMyWeek(tasks: Task[]): WeekDay[] {
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + i);
    return { date, tasks: [], minutes: 0 };
  });
  const CAP = 240;
  for (const task of sortForPlanning(tasks.filter((t) => !t.done))) {
    const limit = task.deadline ? Math.max(0, Math.min(6, dayDiff(task.deadline))) : 6;
    let placed = false;
    for (let i = 0; i <= limit; i++) {
      const day = days[i];
      if (day && day.minutes + (task.duration || 45) <= CAP) {
        day.tasks.push(task);
        day.minutes += task.duration || 45;
        placed = true;
        break;
      }
    }
    if (!placed) {
      const day = days[Math.min(limit, 6)];
      if (day) {
        day.tasks.push(task);
        day.minutes += task.duration || 45;
      }
    }
  }
  return days;
}
