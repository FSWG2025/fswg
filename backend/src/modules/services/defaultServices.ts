/** Canonical public offerings — seeded when the Service collection is empty. */
export const DEFAULT_SERVICES = [
  {
    title: "Rental Guarantee",
    description:
      "Rent in Canada without a Canadian credit history. We assess employment and income, guarantee on-time rent to landlords, and help you avoid huge deposits while building credit through reported payments.",
    category: "real_estate" as const,
    order: 1,
    features: [
      "No Canadian credit score required",
      "Low monthly fee vs. months of deposits",
      "Rent payments help build credit",
      "Landlord partnership option",
    ],
  },
  {
    title: "Insurance Advisory",
    description:
      "Life, health, and protection guidance for newcomers and families. We review existing coverage at no cost and help you choose policies that fit your household — without pressure.",
    category: "insurance" as const,
    order: 2,
    features: [
      "Free initial discovery call",
      "Policy review for gaps and overlaps",
      "Family and income protection options",
    ],
  },
  {
    title: "Advisor Career Path",
    description:
      "Turn financial guidance into a career. Join the First Step advisor network with training, mentorship, and a clear path to licensing and client work across Canada.",
    category: "entrepreneurship" as const,
    order: 3,
    features: [
      "Structured academy modules",
      "Mentorship from experienced advisors",
      "Ethics and client-care training",
    ],
  },
  {
    title: "Real Estate Support",
    description:
      "From first home to investment property — mortgage pre-approval guidance, vetted agents, and step-by-step support through search, offers, and closing.",
    category: "real_estate" as const,
    order: 4,
    features: [
      "Mortgage pre-approval guidance",
      "Vetted agent and lender network",
      "First-time buyer support",
    ],
  },
  {
    title: "Wealth Education",
    description:
      "Practical tools and coaching to grow savings with confidence. Use our wealth calculator and education resources to see how consistent contributions can build over time.",
    category: "wealth_building" as const,
    order: 5,
    features: [
      "Wealth projection tools",
      "Newcomer-friendly investing basics",
      "Automated savings habits",
    ],
  },
  {
    title: "Financial Education",
    description:
      "Clear, jargon-free guidance on banking, credit, budgeting, and the Canadian financial system — designed for newcomers and underserved families.",
    category: "financial_education" as const,
    order: 6,
    features: [
      "Credit building pathways",
      "Banking and money basics",
      "One-on-one discovery consultations",
    ],
  },
];
