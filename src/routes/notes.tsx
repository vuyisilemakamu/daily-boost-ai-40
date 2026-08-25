import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Lightbulb, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { CopyButton } from "@/components/CopyButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NOTES_EXAMPLE, summarizeNotes, type Depth, type Summary } from "@/lib/summarize";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "AI Notes Summarizer — Workflow AI" },
      {
        name: "description",
        content:
          "Paste long meeting notes and get a summary, key points, decisions, action items and deadlines you can edit and copy.",
      },
      { property: "og:title", content: "AI Notes Summarizer — Workflow AI" },
      {
        property: "og:description",
        content: "Turn messy meeting notes into decisions, actions and deadlines.",
      },
    ],
  }),
  component: NotesPage,
});

const DEPTHS: { value: Depth; label: string }[] = [
  { value: "brief", label: "Brief" },
  { value: "standard", label: "Standard" },
  { value: "detailed", label: "Detailed" },
];

function EditableList({
  title,
  items,
  onChange,
}: {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="card-surface animate-rise p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <CopyButton value={items.map((i) => `• ${i}`).join("\n")} label="Copy" />
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <Textarea
              rows={2}
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="min-h-0 resize-y border-transparent bg-muted/40 text-sm hover:border-border focus-visible:border-border"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NotesPage() {
  const [notes, setNotes] = useState("");
  const [depth, setDepth] = useState<Depth>("standard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Summary | null>(null);

  const run = () => {
    if (notes.trim().split(/\s+/).length < 15) {
      toast.error("Paste a bit more text so there's something to summarise");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setResult(summarizeNotes(notes, depth));
      setLoading(false);
      toast.success("Notes summarised");
    }, 600);
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  return (
    <AppLayout title="AI Notes Summarizer" description="Long notes in, decisions and actions out">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="card-surface animate-rise space-y-4 self-start p-5 lg:sticky lg:top-24">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="notes">Your meeting notes</Label>
              <span className="text-xs text-muted-foreground">{wordCount} words</span>
            </div>
            <Textarea
              id="notes"
              rows={16}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste raw notes, a transcript, or a wall of bullet points…"
            />
            <Button variant="ghost" size="sm" onClick={() => setNotes(NOTES_EXAMPLE)}>
              <Lightbulb className="size-3.5" /> Load a demo meeting
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Summary depth</Label>
            <Tabs value={depth} onValueChange={(v) => setDepth(v as Depth)}>
              <TabsList className="w-full">
                {DEPTHS.map((d) => (
                  <TabsTrigger key={d.value} value={d.value} className="flex-1">
                    {d.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={run} disabled={loading}>
              <Sparkles className="size-4" /> Summarise notes
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setNotes("");
                setResult(null);
              }}
            >
              <Trash2 className="size-4" /> Clear
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {loading && (
            <>
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </>
          )}

          {!loading && !result && (
            <div className="card-surface flex flex-col items-center justify-center gap-2 px-6 py-24 text-center">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <FileText className="size-5" />
              </span>
              <p className="text-sm text-muted-foreground">
                Your summary, key points, decisions, action items and deadlines will show up here.
              </p>
            </div>
          )}

          {!loading && result && (
            <>
              <div className="card-surface animate-rise p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">Summary</h3>
                  <CopyButton value={result.summary} label="Copy" />
                </div>
                <Textarea
                  rows={5}
                  value={result.summary}
                  onChange={(e) => setResult({ ...result, summary: e.target.value })}
                  className="mt-3 leading-relaxed"
                />
              </div>

              <EditableList
                title="Key points"
                items={result.keyPoints}
                onChange={(keyPoints) => setResult({ ...result, keyPoints })}
              />
              <EditableList
                title="Decisions made"
                items={result.decisions}
                onChange={(decisions) => setResult({ ...result, decisions })}
              />
              <EditableList
                title="Action items"
                items={result.actionItems}
                onChange={(actionItems) => setResult({ ...result, actionItems })}
              />
              <EditableList
                title="Deadlines mentioned"
                items={result.deadlines}
                onChange={(deadlines) => setResult({ ...result, deadlines })}
              />

              {result.topics.length > 0 && (
                <div className="card-surface animate-rise p-5">
                  <h3 className="font-semibold">Important topics</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.topics.map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
