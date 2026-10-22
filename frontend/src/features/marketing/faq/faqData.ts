export type FAQCategory =
  | "Wealth"
  | "Newcomers"
  | "Housing"
  | "Advice"
  | "Consult"
  | "Insurance"
  | "Rentals"
  | "Credit"
  | "Process"
  | "Partners"
  | "Privacy"
  | "Career";

export type FAQItem = {
  question: string;
  answer: string;
  category: FAQCategory;
};

export const allFaqs: FAQItem[] = [
  {
    category: "Wealth",
    question: "Do I need a lot of money to start investing?",
    answer:
      "Absolutely not. You can start with as little as $50 a month. We'll show you how to use low‑cost index funds and automated contributions to grow your wealth steadily, regardless of your income.",
  },
  {
    category: "Newcomers",
    question: "I'm new to Canada, can you help me navigate the financial system?",
    answer:
      "Yes! We specialise in helping newcomers build credit, open the right bank accounts, understand the housing market, and start investing in Canada. We'll guide you through every step.",
  },
  {
    category: "Housing",
    question: "What if I already have debt? Can I still get a mortgage?",
    answer:
      "Many of our clients have debt, and we help them create a plan to reduce it while still working toward homeownership. We'll connect you with lenders who look at your full financial picture.",
  },
  {
    category: "Advice",
    question: "How is First Step different from a bank or traditional advisor?",
    answer:
      "We're completely independent, we don't push proprietary products. Our advice is always in your best interest, and we focus on education so you understand every decision.",
  },
  {
    category: "Consult",
    question: "Is there a fee for the first consultation?",
    answer:
      "No. The initial discovery call is always free and comes with zero obligation. We want you to feel confident before moving forward.",
  },
  {
    category: "Insurance",
    question: "Can you help with insurance if I already have coverage?",
    answer:
      "Yes. We review existing policies at no cost and show you where coverage may be missing, overlapping, or overpriced: then help you adjust without pressure.",
  },
  {
    category: "Rentals",
    question: "How does the rental guarantee help me build credit?",
    answer:
      "Your on-time rent payments are reported so you can start building a Canadian credit history while you live in your home: something newcomers often can't do on their own.",
  },
  {
    category: "Credit",
    question: "Do I need perfect credit to apply for the rental guarantee?",
    answer:
      "No. We look at employment, income stability, and your overall situation: not just a Canadian credit score you may not have yet.",
  },
  {
    category: "Process",
    question: "How quickly can I get a response after applying?",
    answer:
      "Most applicants hear from us within a few business days. Creating an account helps us follow up faster and keep your documents organized.",
  },
  {
    category: "Partners",
    question: "Can landlords partner with First Step?",
    answer:
      "Yes. Landlords can work with us to fill vacancies with pre-screened tenants and guaranteed rent payments. Reach out through the rental guarantee page to partner with us.",
  },
  {
    category: "Process",
    question: "How long does it take to see results?",
    answer:
      "Many clients feel more confident after the first discovery call. Practical wins: a rental secured, a policy reviewed, or a savings plan started: often follow within weeks once you take the next step.",
  },
  {
    category: "Consult",
    question: "Do I need to bring anything to the first call?",
    answer:
      "Not at all. Just bring an open mind and any questions you have. If documents become useful later, we'll tell you exactly what to prepare: never on day one.",
  },
  {
    category: "Privacy",
    question: "Is my information kept confidential?",
    answer:
      "Absolutely. We follow strict privacy standards. Your details are used only to support your journey with First Step and are never sold or shared for unrelated marketing.",
  },
];
