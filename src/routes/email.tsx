import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, RefreshCw, Trash2, Wand2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { CopyButton } from "@/components/CopyButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EMAIL_EXAMPLE,
  EMAIL_TYPES,
  IMPROVE_EXAMPLE,
  LENGTHS,
  TONES,
  generateEmail,
  improveEmail,
  type EmailType,
  type Length,
  type Tone,
} from "@/lib/email";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workflow AI" },
      {
        name: "description",
        content:
          "Generate a subject line and polished email body from a short brief, or rewrite an existing draft in a new tone.",
      },
      { property: "og:title", content: "Smart Email Generator — Workflow AI" },
      {
        property: "og:description",
        content: "Eight email types, six tones, three lengths — drafted in a click.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const [mode, setMode] = useState<"write" | "improve">("write");
  const [brief, setBrief] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [type, setType] = useState<EmailType>("request");
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<Length>("medium");
  const [variant, setVariant] = useState(0);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const run = (nextVariant = variant) => {
    if (!brief.trim()) {
      toast.error(mode === "write" ? "Describe what you want to say first" : "Paste an email to improve");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result =
        mode === "write"
          ? generateEmail({ brief, type, tone, length, recipient, sender, variant: nextVariant })
          : improveEmail(brief, tone);
      setSubject(result.subject);
      setBody(result.body);
      setLoading(false);
      toast.success(mode === "write" ? "Email drafted" : "Email rewritten");
    }, 550);
  };

  const clear = () => {
    setBrief("");
    setSubject("");
    setBody("");
    setVariant(0);
  };

  return (
    <AppLayout title="Smart Email Generator" description="From a one-line brief to a sendable email">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "write" | "improve")} className="mb-5">
        <TabsList>
          <TabsTrigger value="write">
            <Sparkles className="size-3.5" /> Write new
          </TabsTrigger>
          <TabsTrigger value="improve">
            <Wand2 className="size-3.5" /> Improve / rewrite
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card-surface animate-rise space-y-4 p-5">
          <div className="space-y-2">
            <Label htmlFor="brief">
              {mode === "write" ? "What do you want to say?" : "Paste your existing email"}
            </Label>
            <Textarea
              id="brief"
              rows={7}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder={
                mode === "write"
                  ? "e.g. Ask the design team for the updated mockups before Thursday's review"
                  : "Paste the rough draft here and I'll clean it up…"
              }
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBrief(mode === "write" ? EMAIL_EXAMPLE : IMPROVE_EXAMPLE)}
            >
              <Lightbulb className="size-3.5" /> Use an example
            </Button>
          </div>

          {mode === "write" && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient name</Label>
                  <Input
                    id="recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Sarah"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender">Your name</Label>
                  <Input
                    id="sender"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="Alex"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Email type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as EmailType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Length</Label>
                  <Select value={length} onValueChange={(v) => setLength(v as Length)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LENGTHS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {mode === "improve" && (
            <div className="space-y-2">
              <Label>Rewrite in this tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={() => run(0)} disabled={loading}>
              <Sparkles className="size-4" />
              {mode === "write" ? "Generate email" : "Rewrite email"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const next = variant + 1;
                setVariant(next);
                run(next);
              }}
              disabled={loading || !body}
            >
              <RefreshCw className="size-4" /> Regenerate
            </Button>
            <Button variant="ghost" onClick={clear}>
              <Trash2 className="size-4" /> Clear
            </Button>
          </div>
        </div>

        <div className="card-surface animate-rise space-y-4 p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold">Your email</h2>
            <CopyButton value={subject ? `Subject: ${subject}\n\n${body}` : ""} label="Copy all" />
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : body ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="subject">Subject line</Label>
                  <CopyButton value={subject} label="Copy" />
                </div>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="body">Body — edit inline</Label>
                  <CopyButton value={body} label="Copy" />
                </div>
                <Textarea
                  id="body"
                  rows={16}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="leading-relaxed"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Sparkles className="size-5" />
              </span>
              <p className="text-sm text-muted-foreground">
                Your generated email will appear here, ready to edit and copy.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
