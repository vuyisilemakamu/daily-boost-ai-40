export type Depth = "brief" | "standard" | "detailed";

export type Summary = {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: string[];
  deadlines: string[];
  topics: string[];
};

const STOP = new Set(
  `a an the and or but if then than so to of in on for with at by from as is are was were be been being
   we i you he she it they them our your their this that these those will would can could should have has
   had do does did not no yes about into over after before there here just also very really more most any
   all some out up down what when who how why which`
    .split(/\s+/)
    .filter(Boolean),
);

const DECISION_RE =
  /\b(decided|decision|agreed|we will|approved|signed off|conclusion|resolved|go ahead|chose|selected)\b/i;
const ACTION_RE =
  /\b(action|todo|to-do|will (send|prepare|draft|review|follow|share|set up|check)|needs to|should|assign(ed)?|owner|next step|follow up|takes? on)\b/i;
const DEADLINE_RE =
  /\b(by (monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today|end of (day|week|month)|eod|eow|next week|\d{1,2}(st|nd|rd|th)?( of)? ?[a-z]*)|due|deadline|before \w+|no later than)\b/i;

function sentences(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.replace(/^[\s•\-*\d.)]+/, "").trim())
    .filter((s) => s.split(/\s+/).length > 3);
}

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function trim(s: string, max = 170) {
  return s.length > max ? `${s.slice(0, max).trimEnd()}…` : s;
}

const unique = (arr: string[]) => Array.from(new Set(arr.map((s) => s.trim()))).filter(Boolean);

/** Extractive summarisation using word-frequency sentence scoring. */
export function summarizeNotes(text: string, depth: Depth): Summary {
  const sents = sentences(text);
  if (sents.length === 0) {
    return { summary: "", keyPoints: [], decisions: [], actionItems: [], deadlines: [], topics: [] };
  }

  const freq = new Map<string, number>();
  for (const w of words(text)) freq.set(w, (freq.get(w) ?? 0) + 1);
  const max = Math.max(1, ...freq.values());

  const scored = sents.map((s, i) => {
    const ws = words(s);
    const base = ws.reduce((sum, w) => sum + (freq.get(w) ?? 0) / max, 0) / Math.max(4, ws.length);
    let score = base;
    if (i < 2) score *= 1.25;
    if (DECISION_RE.test(s)) score *= 1.35;
    if (DEADLINE_RE.test(s)) score *= 1.2;
    if (/\d/.test(s)) score *= 1.1;
    return { s, i, score };
  });

  const counts: Record<Depth, { summary: number; points: number }> = {
    brief: { summary: 2, points: 3 },
    standard: { summary: 4, points: 5 },
    detailed: { summary: 7, points: 9 },
  };
  const cfg = counts[depth];

  const pick = (n: number) =>
    [...scored]
      .sort((a, b) => b.score - a.score)
      .slice(0, n)
      .sort((a, b) => a.i - b.i)
      .map((x) => x.s);

  const summary = pick(cfg.summary).join(" ");
  const keyPoints = pick(cfg.points).map((s) => trim(s));

  const decisions = unique(sents.filter((s) => DECISION_RE.test(s)).map((s) => trim(s))).slice(0, 6);
  const actionItems = unique(
    sents.filter((s) => ACTION_RE.test(s) && !DECISION_RE.test(s)).map((s) => trim(s)),
  ).slice(0, 8);
  const deadlines = unique(sents.filter((s) => DEADLINE_RE.test(s)).map((s) => trim(s, 140))).slice(
    0,
    6,
  );

  const topics = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, depth === "brief" ? 5 : depth === "standard" ? 8 : 12)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));

  return { summary, keyPoints, decisions, actionItems, deadlines, topics };
}

export const NOTES_EXAMPLE = `Weekly product sync — Tuesday 09:30. Attendees: Sarah (design), Miguel (engineering), Priya (marketing), me.

Sarah walked through the new onboarding flow. The three-step wizard tested much better than the single long form, with completion up from 41% to 68% in the prototype study. We decided to ship the three-step version and drop the long form entirely.

Miguel raised that the signup API is timing out under load, roughly 2% of requests over 4 seconds. He will add caching on the profile lookup and report back by Thursday. Engineering agreed the fix has to land before the marketing push.

Priya said the launch campaign is drafted but blocked on final screenshots. She needs the updated mockups from Sarah by end of week, otherwise the email send slips to the following Monday. Priya will prepare two subject line variants for an A/B test.

We also discussed pricing. No decision was made — we will revisit pricing tiers next week once finance shares the margin numbers.

Action items: Sarah to deliver final onboarding mockups by Friday. Miguel to fix the signup timeout and share metrics on Thursday. Priya to finalise campaign copy and set up the A/B test. I will book the pricing review with finance for next Tuesday.`;
