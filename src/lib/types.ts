export type Priority = "low" | "medium" | "high" | "urgent";

export type Step = {
  id: string;
  text: string;
  done: boolean;
};

export type Task = {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  deadline: string; // yyyy-mm-dd
  duration: number; // minutes
  done: boolean;
  steps: Step[];
  createdAt: number;
};

export const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

export const priorityLabel: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
