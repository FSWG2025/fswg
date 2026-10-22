import { allFaqs, type FAQItem } from "@/features/marketing/faq/faqData";
import searchIndex from "@/lib/searchIndex";
import { searchSiteIndex, type SiteSearchHit } from "@/lib/siteSearch";

export type VoiceAnswerConfidence = "high" | "medium" | "low";

export type VoiceAnswer = {
  question: string;
  answer: string;
  matchedQuestion?: string;
  category?: string;
  confidence: VoiceAnswerConfidence;
  related: SiteSearchHit[];
};

type KnowledgeItem = FAQItem & { id: string; aliases?: string[] };

const SITE_OVERVIEW =
  "First Step Wealth Group is a Canadian platform that helps newcomers, immigrants, and families take confident financial steps. The website covers rental guarantee support when you may not have Canadian credit or a guarantor, insurance and advisor career pathways, real estate and mortgage guidance, wealth education with a compounding calculator, a blog, FAQs, testimonials, and a free discovery call to get started. You can browse services, create an account for applications and documents, and reach the team from almost any page.";

/** Structured site knowledge so voice can answer almost any site-related question. */
const SITE_KNOWLEDGE: KnowledgeItem[] = [
  {
    id: "overview",
    category: "About",
    question: "What is this website all about?",
    aliases: [
      "what is first step",
      "what do you do",
      "tell me about the website",
      "what is the site about",
      "explain the website",
      "overview of the platform",
      "who are you",
      "what is fswg",
      "first step wealth group",
      "entire website",
      "whole website",
      "everything about",
    ],
    answer: SITE_OVERVIEW,
  },
  {
    id: "mission",
    category: "About",
    question: "What is First Step Wealth Group's mission?",
    aliases: ["mission", "purpose", "why first step", "who do you help"],
    answer:
      "Our mission is to close the wealth gap one financial decision at a time. We specialise in helping newcomers and underserved families in Canada with housing, insurance, real estate readiness, and wealth education so they can build stability with clear next steps.",
  },
  {
    id: "who-for",
    category: "About",
    question: "Who is this website for?",
    aliases: ["who is it for", "target audience", "newcomers", "immigrants", "families"],
    answer:
      "This website is built for newcomers to Canada, immigrants, and families who need practical help with renting, insurance, buying a home later, and building wealth. Landlords and people exploring an advisor career can also find pathways here.",
  },
  {
    id: "pages",
    category: "About",
    question: "What pages are on this website?",
    aliases: ["sitemap", "what can i find", "sections", "menu", "navigation"],
    answer:
      "Main areas include Home, About, Testimonials, Rental Guarantee, Insurance and Advisor, Real Estate, All Services, Wealth Calculator, Blog, FAQ, and ways to book a free discovery call or sign in. After you create an account you can also use dashboard tools like housing preferences, document vault, messages, and wealth studio.",
  },
  {
    id: "get-started",
    category: "Process",
    question: "How do I get started on this website?",
    aliases: ["get started", "how to begin", "first step", "where do i start"],
    answer:
      "Start by exploring the service that matches your need, or book a free discovery call. You can also create an account to apply for rental support, upload documents, and message the team. If you are unsure, ask about rental guarantee, insurance, real estate, or wealth and we will point you to the right page.",
  },
  {
    id: "contact",
    category: "Consult",
    question: "How can I contact First Step or book a call?",
    aliases: ["contact", "book a call", "discovery call", "speak to someone", "whatsapp"],
    answer:
      "You can book a free discovery consultation from the site with no obligation. Many pages also offer lead forms, and rental inquiries can connect through WhatsApp where available. Signing in lets you message support from your dashboard.",
  },
  {
    id: "services",
    category: "About",
    question: "What services does First Step offer?",
    aliases: ["services", "what do you offer", "products", "programs"],
    answer:
      "Core services are the Rental Guarantee program, Insurance advisory and advisor network opportunities, Real Estate and mortgage guidance, and Wealth education including the compounding calculator. You can also browse All Services and read the Blog for education.",
  },
  {
    id: "rental",
    category: "Rentals",
    question: "What is the rental guarantee?",
    aliases: [
      "rental guarantee",
      "rent without credit",
      "guarantor",
      "landlord",
      "housing rental",
    ],
    answer:
      "The Rental Guarantee helps newcomers and families rent in Canada when they may not have a local guarantor or Canadian credit history. We work with landlords so rent is backed, and on-time payments can help you build credit. Open the Rental Guarantee page to check eligibility or apply.",
  },
  {
    id: "insurance",
    category: "Insurance",
    question: "What insurance help do you offer?",
    aliases: ["insurance", "life insurance", "disability", "critical illness", "coverage"],
    answer:
      "We help with life, critical illness, disability, and related coverage conversations. Advisors can review what you already have and flag gaps without pushing proprietary products. The Insurance page also covers becoming a licensed advisor with training and mentorship.",
  },
  {
    id: "advisor-career",
    category: "Career",
    question: "Can I join the advisor network?",
    aliases: ["become an advisor", "advisor network", "career", "join network", "recruitment"],
    answer:
      "Yes. First Step offers a pathway to become a financial advisor with paid training and mentorship. Visit the Insurance and Advisor page to learn more and apply through the advisor application flow.",
  },
  {
    id: "real-estate",
    category: "Housing",
    question: "Can you help with real estate and mortgages?",
    aliases: ["real estate", "mortgage", "home buyer", "buy a house", "investment property"],
    answer:
      "Yes. The Real Estate area supports first-home and investment-property journeys with mortgage pre-approval guidance, vetted agent connections, and next-step planning. Start on the Real Estate page or book a free discovery call.",
  },
  {
    id: "wealth",
    category: "Wealth",
    question: "How does the wealth calculator work?",
    aliases: [
      "wealth calculator",
      "compound interest",
      "investing",
      "savings growth",
      "projection",
    ],
    answer:
      "The Wealth page calculator is an educational tool. Enter a monthly deposit and a sample return rate to see how compounding can grow over decades. It illustrates the idea of steady saving; it is not a promise of future investment results. Book a free call when you want a personal plan.",
  },
  {
    id: "blog",
    category: "About",
    question: "Is there a blog or educational content?",
    aliases: ["blog", "articles", "education", "learn", "insights"],
    answer:
      "Yes. The Blog shares financial insights and education for newcomers and families. You will also find FAQ answers and service pages that explain rental, insurance, real estate, and wealth topics in plain language.",
  },
  {
    id: "account",
    category: "Process",
    question: "Why should I create an account?",
    aliases: ["register", "sign up", "login", "dashboard", "account"],
    answer:
      "Creating an account lets you manage applications, upload documents to your vault, set housing preferences, use wealth and insurance planning tools, and message the team. Sign in or register from the navigation when you are ready.",
  },
  {
    id: "cities",
    category: "About",
    question: "Where does First Step operate?",
    aliases: ["cities", "provinces", "canada", "locations", "where do you operate"],
    answer:
      "First Step focuses on families across Canada, with impact highlighted across multiple cities and provinces. Exact availability for rentals and advisors can vary, so check the service page for your need or book a call to confirm support in your area.",
  },
  {
    id: "cost",
    category: "Consult",
    question: "Does it cost money to use this website?",
    aliases: ["price", "cost", "free", "fees", "pay"],
    answer:
      "Browsing the site, using the wealth calculator, reading the blog and FAQs, and the initial discovery call are free. Specific programs like rental guarantee or insurance products have their own processes; advisors explain any next steps clearly before you commit.",
  },
  {
    id: "privacy",
    category: "Privacy",
    question: "Is my information kept confidential?",
    aliases: ["privacy", "confidential", "data", "secure"],
    answer:
      "Yes. First Step follows strict privacy standards. Your details are used to support your journey with us and are not sold for unrelated marketing.",
  },
  {
    id: "testimonials",
    category: "About",
    question: "Do you have client testimonials?",
    aliases: ["testimonials", "reviews", "success stories", "what people say"],
    answer:
      "Yes. The Testimonials page shares what people say about working with First Step. It is a good place to hear real experiences alongside the service pages.",
  },
];

const FAQ_AS_KNOWLEDGE: KnowledgeItem[] = allFaqs.map((faq, i) => ({
  ...faq,
  id: `faq-${i}`,
}));

const KNOWLEDGE: KnowledgeItem[] = [...SITE_KNOWLEDGE, ...FAQ_AS_KNOWLEDGE];

const STOP = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "am",
  "was",
  "were",
  "do",
  "does",
  "did",
  "can",
  "could",
  "would",
  "should",
  "i",
  "me",
  "my",
  "we",
  "you",
  "your",
  "to",
  "of",
  "in",
  "on",
  "for",
  "and",
  "or",
  "with",
  "how",
  "what",
  "when",
  "where",
  "why",
  "who",
  "please",
  "need",
  "want",
]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9$\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function isSiteOverviewIntent(raw: string): boolean {
  const q = raw.toLowerCase();
  return (
    /(what('?s| is| are)?\s+(this|the)\s+(web\s*)?site|entire\s+(web\s*)?site|whole\s+(web\s*)?site|all\s+about|tell\s+me\s+about\s+(this|the|first\s+step|fswg|your)|what\s+do\s+you\s+(do|offer)|who\s+are\s+you|overview|platform\s+about|first\s+step\s+wealth)/i.test(
      q,
    ) ||
    (/\b(website|site|platform|company|business)\b/i.test(q) &&
      /\b(about|overview|explain|purpose|mean|for)\b/i.test(q))
  );
}

function scoreItem(item: KnowledgeItem, queryTokens: string[], raw: string): number {
  const q = item.question.toLowerCase();
  const a = item.answer.toLowerCase();
  const c = item.category.toLowerCase();
  const aliases = (item.aliases || []).join(" ").toLowerCase();
  const hay = `${q} ${a} ${c} ${aliases}`;
  const rawLower = raw.toLowerCase();
  let score = 0;

  for (const alias of item.aliases || []) {
    if (rawLower.includes(alias.toLowerCase())) score += 55;
  }

  for (const t of queryTokens) {
    if (aliases.includes(t)) score += 14;
    else if (q.includes(t)) score += 12;
    else if (c.includes(t)) score += 8;
    else if (a.includes(t)) score += 4;
    else if (hay.includes(t)) score += 2;
  }

  const boosts: Array<[RegExp, number]> = [
    [/rental\s*guarantee|guarantor|landlord|rent(ing|al)?/i, 22],
    [/invest|wealth|compound|tfsa|rrsp|savings?|calculator/i, 20],
    [/insur(ance|e)|policy|coverage|life|disability/i, 20],
    [/mortgage|home\s*buy|real\s*estate|house/i, 18],
    [/credit\s*score|build\s*credit|newcomer|immigrant/i, 16],
    [/fee|cost|price|free\s*(call|consult)/i, 12],
    [/debt|loan/i, 12],
    [/privacy|confidential|data/i, 12],
    [/advisor|career|join\s*network/i, 16],
    [/blog|article|learn|education/i, 14],
    [/testimonial|review|success/i, 14],
    [/login|register|account|dashboard|sign\s*up/i, 14],
    [/contact|book|call|whatsapp/i, 14],
    [/service|program|offer/i, 12],
    [/website|site|platform|company|fswg|first\s+step/i, 18],
  ];

  for (const [re, pts] of boosts) {
    if (re.test(raw) && re.test(hay)) score += pts;
  }

  if (raw.length > 8 && q.includes(rawLower.slice(0, Math.min(rawLower.length, 48)))) {
    score += 24;
  }

  return score;
}

function relatedFor(question: string, fallbackQuery: string): SiteSearchHit[] {
  const hits = searchSiteIndex(question, 8);
  if (hits.length >= 3) return hits;
  return searchSiteIndex(fallbackQuery, 8);
}

function synthesizeFromIndex(question: string): VoiceAnswer | null {
  const hits = searchSiteIndex(question, 8);
  if (hits.length === 0) {
    // Broad browse of static index titles when query is very vague
    const broad = searchIndex
      .filter((item) => item.type === "page" || item.type === "section")
      .slice(0, 6)
      .map((item, i) => ({
        id: `page-${i}`,
        type: item.type,
        title: item.title,
        snippet: item.snippet,
        url: item.url,
        sectionId: item.sectionId,
      }));
    if (!broad.length) return null;
    return {
      question,
      answer: `${SITE_OVERVIEW} Here are key areas you can open next.`,
      matchedQuestion: "Website overview",
      category: "About",
      confidence: "medium",
      related: broad,
    };
  }

  const lines = hits
    .slice(0, 4)
    .map((h) => `${h.title}: ${h.snippet}`)
    .join(" ");

  return {
    question,
    answer: `Here is what I found on the First Step website related to your question. ${lines} You can open any related page below for full details, or ask about rental guarantee, insurance, real estate, or wealth.`,
    confidence: hits.some((h) => h.type === "faq") ? "medium" : "low",
    related: hits,
  };
}

/**
 * Match a spoken/typed question to site knowledge, FAQs, and pages.
 * Fully client-side: no audio leaves the browser beyond the Web Speech API.
 */
export function answerVoiceQuestion(input: string): VoiceAnswer {
  const question = input.trim().replace(/\s+/g, " ");

  if (!question) {
    return {
      question,
      answer: SITE_OVERVIEW,
      matchedQuestion: "What is this website all about?",
      category: "About",
      confidence: "high",
      related: relatedFor("first step services", "rental guarantee wealth insurance"),
    };
  }

  if (isSiteOverviewIntent(question)) {
    const overview = SITE_KNOWLEDGE.find((k) => k.id === "overview")!;
    return {
      question,
      answer: overview.answer,
      matchedQuestion: overview.question,
      category: overview.category,
      confidence: "high",
      related: relatedFor(question, "rental guarantee insurance real estate wealth"),
    };
  }

  const queryTokens = tokens(question);
  const ranked = KNOWLEDGE.map((item) => ({
    item,
    score: scoreItem(item, queryTokens, question),
  })).sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const second = ranked[1];

  // Require a real match so weak FAQ noise (e.g. "Not at all") cannot win
  if (best && best.score >= 22) {
    const margin = best.score - (second?.score ?? 0);
    const confidence: VoiceAnswerConfidence =
      best.score >= 50 || (best.score >= 34 && margin >= 8)
        ? "high"
        : best.score >= 28
          ? "medium"
          : "low";

    return {
      question,
      answer: best.item.answer,
      matchedQuestion: best.item.question,
      category: best.item.category,
      confidence,
      related: relatedFor(question, best.item.question),
    };
  }

  const synthesized = synthesizeFromIndex(question);
  if (synthesized) return synthesized;

  return {
    question,
    answer: SITE_OVERVIEW,
    matchedQuestion: "What is this website all about?",
    category: "About",
    confidence: "medium",
    related: relatedFor(question, "rental guarantee insurance wealth about"),
  };
}

/** Calm, natural English female voices preferred across platforms. */
const PREFERRED_FEMALE = [
  "microsoft aria",
  "microsoft jenny",
  "microsoft sara",
  "microsoft zira",
  "google uk english female",
  "google us english female",
  "samantha",
  "karen",
  "moira",
  "fiona",
  "tessa",
  "veena",
  "victoria",
  "allison",
  "ava",
  "zoe",
  "susan",
  "kathy",
  "serena",
  "nicky",
  "martha",
];

const MALE_HINTS =
  /\b(male|david|daniel|mark|alex|fred|thomas|george|james|john|tom|oliver|arthur|gordon|bruce|lee|ravi)\b/i;

const FEMALE_HINTS =
  /\b(female|woman|girl|samantha|karen|moira|fiona|zira|aria|jenny|sara|susan|kathy|victoria|allison|ava|zoe|tessa|serena|martha|veena|nicky)\b/i;

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve([]);
  }
  if (voicesReady) return voicesReady;

  voicesReady = new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const done = () => {
      synth.removeEventListener("voiceschanged", done);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", done);
    window.setTimeout(() => resolve(synth.getVoices()), 350);
  });

  return voicesReady;
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = (voice.lang || "").toLowerCase();
  let score = 0;

  if (!lang.startsWith("en")) return -1000;
  if (MALE_HINTS.test(name) && !FEMALE_HINTS.test(name)) return -500;

  if (lang.startsWith("en-ca")) score += 40;
  else if (lang.startsWith("en-us")) score += 36;
  else if (lang.startsWith("en-gb")) score += 34;
  else if (lang.startsWith("en-au") || lang.startsWith("en-ie") || lang.startsWith("en-za"))
    score += 30;
  else score += 18;

  const prefIndex = PREFERRED_FEMALE.findIndex((p) => name.includes(p));
  if (prefIndex >= 0) score += 80 - prefIndex;

  if (FEMALE_HINTS.test(name)) score += 35;
  if (/neural|natural|premium|enhanced|online/.test(name)) score += 28;
  if (voice.localService) score += 8;
  if (voice.default) score += 4;

  return score;
}

async function pickCalmFemaleVoice(): Promise<SpeechSynthesisVoice | null> {
  if (cachedVoice) return cachedVoice;
  const voices = await loadVoices();
  if (!voices.length) return null;

  const ranked = [...voices]
    .map((v) => ({ v, score: scoreVoice(v) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  cachedVoice = ranked[0]?.v ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
  return cachedVoice;
}

/**
 * Speak with a calm, natural English female voice when available.
 * Rate stays near conversational (not sluggish).
 */
export function speakText(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return;

  window.speechSynthesis.cancel();

  void pickCalmFemaleVoice().then((voice) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleaned);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || "en-CA";
    } else {
      utterance.lang = "en-CA";
    }
    utterance.rate = 0.96;
    utterance.pitch = 1.02;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}
