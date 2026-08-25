import { useCallback, useEffect, useState } from "react";
import type { Priority, Task } from "./types";
import { generateSteps, uid } from "./planner";

const KEY = "workflow-ai.tasks.v1";

function seed(): Task[] {
  const iso = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  const make = (
    name: string,
    description: string,
    priority: Priority,
    deadline: string,
    duration: number,
    done = false,
  ): Task => ({
    id: uid(),
    name,
    description,
    priority,
    deadline,
    duration,
    done,
    steps: generateSteps(name, description).map((s, i) => ({ ...s, done: done || i === 0 })),
    createdAt: Date.now(),
  });

  return [
    make("Draft Q3 performance report", "Pull metrics and write the summary for leadership", "high", iso(0), 90),
    make("Reply to client onboarding email", "Confirm timeline and next steps", "urgent", iso(0), 20),
    make("Prepare launch presentation deck", "Ten slides for Thursday's review", "high", iso(2), 120),
    make("Plan sprint roadmap", "Sequence the next two sprints", "medium", iso(4), 60),
    make("Fix signup timeout bug", "Add caching on profile lookup", "medium", iso(-1), 75),
    make("Send team meeting recap", "Notes and action items from Monday", "low", iso(-2), 25, true),
  ];
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setTasks(raw ? (JSON.parse(raw) as Task[]) : seed());
    } catch {
      setTasks(seed());
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(tasks));
    } catch {
      /* storage unavailable */
    }
  }, [tasks, loaded]);

  const addTask = useCallback(
    (input: {
      name: string;
      description: string;
      priority: Priority;
      deadline: string;
      duration: number;
    }) => {
      const task: Task = {
        id: uid(),
        ...input,
        done: false,
        steps: generateSteps(input.name, input.description),
        createdAt: Date.now(),
      };
      setTasks((prev) => [task, ...prev]);
      return task;
    },
    [],
  );

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, done: !t.done, steps: t.steps.map((s) => ({ ...s, done: !t.done })) }
          : t,
      ),
    );
  }, []);

  const toggleStep = useCallback((taskId: string, stepId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const steps = t.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s));
        return { ...t, steps, done: steps.length > 0 && steps.every((s) => s.done) };
      }),
    );
  }, []);

  const move = useCallback((id: string, dir: -1 | 1) => {
    setTasks((prev) => {
      const i = prev.findIndex((t) => t.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const a = next[i]!;
      next[i] = next[j]!;
      next[j] = a;
      return next;
    });
  }, []);

  const reset = useCallback(() => setTasks(seed()), []);

  return {
    tasks,
    loaded,
    addTask,
    updateTask,
    removeTask,
    toggleTask,
    toggleStep,
    move,
    reset,
  };
}
