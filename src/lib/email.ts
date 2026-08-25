export type EmailType =
  | "request"
  | "follow-up"
  | "meeting"
  | "update"
  | "apology"
  | "thank-you"
  | "introduction"
  | "decline";

export type Tone = "professional" | "friendly" | "formal" | "direct" | "warm" | "persuasive";
export type Length = "short" | "medium" | "long";

export const EMAIL_TYPES: { value: EmailType; label: string }[] = [
  { value: "request", label: "Request" },
  { value: "follow-up", label: "Follow-up" },
  { value: "meeting", label: "Meeting invite" },
  { value: "update", label: "Status update" },
  { value: "apology", label: "Apology" },
  { value: "thank-you", label: "Thank you" },
  { value: "introduction", label: "Introduction" },
  { value: "decline", label: "Polite decline" },
];

export const TONES: { value: Tone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "direct", label: "Direct" },
  { value: "warm", label: "Warm" },
  { value: "persuasive", label: "Persuasive" },
];

export const LENGTHS: { value: Length; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Detailed" },
];

const OPENERS: Record<Tone, string[]> = {
  professional: ["Hi {name},", "Hello {name},"],
  friendly: ["Hi {name}!", "Hey {name},"],
  formal: ["Dear {name},", "Dear {name},"],
  direct: ["{name},", "Hi {name},"],
  warm: ["Hi {name}, I hope you're doing well.", "Hello {name}, hope your week is going well."],
  persuasive: ["Hi {name},", "Hello {name},"],
};

const CLOSERS: Record<Tone, string> = {
  professional: "Best regards,",
  friendly: "Thanks so much,",
  formal: "Yours sincerely,",
  direct: "Thanks,",
  warm: "Warm regards,",
  persuasive: "Looking forward to your thoughts,",
};

const SUBJECTS: Record<EmailType, (topic: string) => string> = {
  request: (t) => `Quick request: ${t}`,
  "follow-up": (t) => `Following up on ${t}`,
  meeting: (t) => `Time to meet about ${t}?`,
  update: (t) => `Update: ${t}`,
  apology: (t) => `Apologies regarding ${t}`,
  "thank-you": (t) => `Thank you — ${t}`,
  introduction: (t) => `Introduction: ${t}`,
  decline: (t) => `Re: ${t}`,
};

const BODY_CORE: Record<EmailType, (topic: string) => string[]> = {
  request: (t) => [
    `I'm reaching out about ${t}.`,
    `Would you be able to help with this? If it's easier, I'm happy to jump on a short call and walk through the details.`,
  ],
  "follow-up": (t) => [
    `I wanted to follow up on ${t}.`,
    `I know things get busy — a quick note on where it stands would be really helpful so I can plan around it.`,
  ],
  meeting: (t) => [
    `I'd like to set up some time to discuss ${t}.`,
    `Would 30 minutes work this week? I'm flexible and happy to work around your calendar.`,
  ],
  update: (t) => [
    `Here's a quick update on ${t}.`,
    `Work is progressing as planned and I'll flag anything that needs a decision from you as soon as it comes up.`,
  ],
  apology: (t) => [
    `I want to apologise for ${t}.`,
    `That wasn't the experience I'd want on my side either. Here's what I'm doing to put it right, and how I'll keep it from happening again.`,
  ],
  "thank-you": (t) => [
    `Thank you for ${t}.`,
    `It genuinely made a difference, and I appreciate the time and care you put into it.`,
  ],
  introduction: (t) => [
    `I wanted to introduce myself in connection with ${t}.`,
    `I'd love to learn more about your priorities and share where I think we could be useful to each other.`,
  ],
  decline: (t) => [
    `Thank you for thinking of me regarding ${t}.`,
    `After considering it, I'm not able to take this on right now. I'd be glad to stay in touch for future opportunities.`,
  ],
};

const EXTRA: Record<Tone, string> = {
  professional: "Please let me know if you need anything further from me.",
  friendly: "Just shout if you'd like me to pick any of this up!",
  formal: "I remain at your disposal should further information be required.",
  direct: "Let me know either way.",
  warm: "Thanks again for your time — it's much appreciated.",
  persuasive: "I'm confident this is worth the small amount of time it takes.",
};

const DETAIL: Record<EmailType, string> = {
  request: "For context, this is time-sensitive on my side, so any pointer on the next step helps.",
  "follow-up": "If it's stalled somewhere, tell me and I'll take the chasing off your plate.",
  meeting: "I'll send an agenda ahead of time so we can keep it tight and useful.",
  update: "I've listed the next milestones below so you can see what's coming.",
  apology: "I've reviewed what went wrong and tightened the process on my end.",
  "thank-you": "I'll make sure the team hears about it too.",
  introduction: "I've kept this short, but I'm happy to share more detail whenever suits you.",
  decline: "I hope the timing works out better for us down the line.",
};

function cleanTopic(input: string) {
  const t = input.trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "");
  const stripped = t.replace(
    /^(i want to|i need to|please |can you |write an? email (to )?|ask (them )?(to )?|tell (them )?(that )?)/i,
    "",
  );
  const out = stripped || "this";
  return out.charAt(0).toLowerCase() + out.slice(1);
}

export type GeneratedEmail = { subject: string; body: string };

export function generateEmail(opts: {
  brief: string;
  type: EmailType;
  tone: Tone;
  length: Length;
  recipient?: string;
  sender?: string;
  variant?: number;
}): GeneratedEmail {
  const topic = cleanTopic(opts.brief);
  const name = opts.recipient?.trim() || "there";
  const variant = opts.variant ?? 0;
  const openers = OPENERS[opts.tone];
  const opener = (openers[variant % openers.length] ?? openers[0]!).replace("{name}", name);

  const core = BODY_CORE[opts.type](topic);
  const paras: string[] = [opener, core[0]!];
  if (opts.length !== "short") paras.push(core[1]!);
  if (opts.length === "long") paras.push(DETAIL[opts.type], EXTRA[opts.tone]);
  else if (opts.length === "medium") paras.push(EXTRA[opts.tone]);

  paras.push(`${CLOSERS[opts.tone]}\n${opts.sender?.trim() || "[Your name]"}`);

  return {
    subject: SUBJECTS[opts.type](topic).replace(/\s+/g, " "),
    body: paras.join("\n\n"),
  };
}

const FILLER = [
  /\bjust\b/gi,
  /\bactually\b/gi,
  /\bbasically\b/gi,
  /\bkind of\b/gi,
  /\bsort of\b/gi,
  /\bvery\b/gi,
  /\breally\b/gi,
  /\bi think that\b/gi,
];

const SOFTEN: [RegExp, string][] = [
  [/\bASAP\b/g, "as soon as you can"],
  [/\bu\b/gi, "you"],
  [/\bthx\b/gi, "thanks"],
  [/\bpls\b/gi, "please"],
  [/\bgonna\b/gi, "going to"],
  [/\bwanna\b/gi, "want to"],
  [/!{2,}/g, "!"],
  [/\?{2,}/g, "?"],
];

/** Clean up and re-tone an existing email. */
export function improveEmail(raw: string, tone: Tone): GeneratedEmail {
  let text = raw.trim();
  for (const [re, rep] of SOFTEN) text = text.replace(re, rep);
  if (tone === "formal" || tone === "professional") {
    for (const re of FILLER) text = text.replace(re, "");
  }
  const paras = text
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const s = p.replace(/\s+/g, " ");
      const capped = s.charAt(0).toUpperCase() + s.slice(1);
      return /[.!?,:]$/.test(capped) ? capped : `${capped}.`;
    });

  const first = paras[0] ?? "";
  const hasGreeting = /^(hi|hey|hello|dear)\b/i.test(first);
  const hasSignoff = /(regards|thanks|sincerely|best)\b/i.test(paras[paras.length - 1] ?? "");

  const out: string[] = [];
  if (!hasGreeting) out.push(OPENERS[tone][0]!.replace("{name}", "there"));
  out.push(...paras);
  if (!hasSignoff) out.push(`${CLOSERS[tone]}\n[Your name]`);

  const topicSource = paras.find((p) => !/^(hi|hey|hello|dear)\b/i.test(p)) ?? "your message";
  const subject = topicSource.split(" ").slice(0, 7).join(" ").replace(/[.,]$/, "");

  return { subject: subject.charAt(0).toUpperCase() + subject.slice(1), body: out.join("\n\n") };
}

export const EMAIL_EXAMPLE =
  "Ask Sarah from the design team for the updated onboarding mockups before Thursday's client review, and offer to jump on a call if anything is blocked.";

export const IMPROVE_EXAMPLE =
  "hey sarah just wondering if u had the mockups?? we really kind of need them ASAP because the client review is thursday and i basically cant finish the deck without them thx";
