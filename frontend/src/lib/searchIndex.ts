export interface SearchableItem {
  title: string;
  snippet: string;
  url: string;
  sectionId?: string;
  type: "page" | "section" | "faq" | "topic" | "service_static" | "insight";
}

const searchIndex: SearchableItem[] = [
  // Public pages
  { title: "Home", snippet: "Your First Step Into a Lifetime of Wealth", url: "/", type: "page" },
  { title: "Rental Guarantee", snippet: "New to Canada? Let's Help You Rent", url: "/rental-guarantee", type: "page" },
  { title: "Insurance & Advisor", snippet: "Transform your career: become a financial advisor", url: "/insurance", type: "page" },
  { title: "Real Estate Support", snippet: "From first home to investment property", url: "/real-estate", type: "page" },
  { title: "Wealth Calculator", snippet: "Project your financial future", url: "/wealth", type: "page" },
  { title: "About Us", snippet: "Our mission and community impact", url: "/about", type: "page" },
  { title: "Testimonials", snippet: "What Are People Saying?", url: "/testimonials", type: "page" },
  { title: "FAQ", snippet: "Frequently Asked Questions", url: "/#faq", sectionId: "faq", type: "section" },
  { title: "Our Services", snippet: "Rental, insurance, real estate, and wealth services", url: "/services", type: "page" },
  { title: "Blog", snippet: "Financial insights and education", url: "/blog", type: "page" },
  { title: "Join the advisor network", snippet: "Apply to become a First Step financial advisor", url: "/insurance", type: "page" },
  { title: "Contact / Book a call", snippet: "Book a free discovery consultation", url: "/#cta", sectionId: "cta", type: "section" },
  { title: "Housing preferences", snippet: "Tell us what kind of rental or home you need", url: "/app/housing", type: "page" },
  { title: "Document vault", snippet: "Upload ID, income, and application documents", url: "/app/documents", type: "page" },
  { title: "Wealth studio", snippet: "Illustrative savings and wealth projections", url: "/app/wealth-studio", type: "page" },
  { title: "Insurance planner", snippet: "Coverage needs conversations for families", url: "/app/insurance-planner", type: "page" },
  { title: "Messages", snippet: "Chat with support and your advisor team", url: "/app/messages", type: "page" },
  { title: "Login", snippet: "Sign in to your First Step account", url: "/login", type: "page" },
  { title: "Register", snippet: "Create a First Step Wealth Group account", url: "/register", type: "page" },
  { title: "Mortgage", snippet: "Mortgage pre-approval guidance for buyers in Canada", url: "/real-estate", type: "topic" },
  { title: "Housing", snippet: "Housing and rental support for newcomers to Canada", url: "/rental-guarantee", type: "topic" },
  { title: "Credit building", snippet: "Build Canadian credit through reported rent payments", url: "/rental-guarantee", type: "topic" },
  { title: "Landlord partnership", snippet: "Partner with First Step for guaranteed rent", url: "/rental-guarantee", type: "topic" },
  { title: "Discovery call", snippet: "The initial discovery call is always free", url: "/#faq", sectionId: "faq", type: "faq" },

  // FAQ items
  { title: "Do I need a lot of money to start investing?", snippet: "Absolutely not. You can start with as little as $50 a month.", url: "/#faq", sectionId: "faq", type: "faq" },
  { title: "I'm new to Canada, can you help me?", snippet: "Yes! We specialise in helping newcomers.", url: "/#faq", sectionId: "faq", type: "faq" },
  { title: "What if I already have debt?", snippet: "Many of our clients have debt, and we help them create a plan.", url: "/#faq", sectionId: "faq", type: "faq" },
  { title: "How is First Step different from a bank?", snippet: "We're completely independent, we don't push proprietary products.", url: "/#faq", sectionId: "faq", type: "faq" },
  { title: "Is there a fee for the first consultation?", snippet: "No. The initial discovery call is always free.", url: "/#faq", sectionId: "faq", type: "faq" },
  { title: "Can you help with insurance?", snippet: "Definitely. We'll review your existing policies for free.", url: "/#faq", sectionId: "faq", type: "faq" },
  { title: "How does the rental guarantee help me build credit?", snippet: "Your on-time rent payments are reported so you can build Canadian credit.", url: "/#faq", sectionId: "faq", type: "faq" },
  { title: "Do I need perfect credit for the rental guarantee?", snippet: "No. We look at employment and income stability, not just a credit score.", url: "/#faq", sectionId: "faq", type: "faq" },
  { title: "How quickly can I get a response after applying?", snippet: "Most applicants hear from us within a few business days.", url: "/#faq", sectionId: "faq", type: "faq" },
  { title: "Can landlords partner with First Step?", snippet: "Yes: fill vacancies with pre-screened tenants and guaranteed rent.", url: "/#faq", sectionId: "faq", type: "faq" },
  { title: "How long does it take to see results?", snippet: "Many clients start feeling more confident after the first call.", url: "/#faq", sectionId: "faq", type: "faq" },
  { title: "Do I need to bring anything?", snippet: "Not at all. Just bring an open mind.", url: "/#faq", sectionId: "faq", type: "faq" },
  { title: "Is my information kept confidential?", snippet: "Absolutely. We follow strict privacy standards.", url: "/#faq", sectionId: "faq", type: "faq" },

  // Rental topics
  { title: "Understanding the Rental Market", snippet: "Learn how the Canadian rental market works.", url: "/rental-guarantee", type: "topic" },
  { title: "Building Credit from Scratch", snippet: "Even with no Canadian credit history, you can build a strong profile quickly.", url: "/rental-guarantee", type: "topic" },
  { title: "Rental Application Tips", snippet: "Stand out from other applicants.", url: "/rental-guarantee", type: "topic" },
  { title: "The Rental Guarantee Program", snippet: "Our flagship program that guarantees your rent to landlords.", url: "/rental-guarantee", type: "topic" },

  // Insurance & Business
  { title: "Life & Critical Illness Insurance", snippet: "Compare Canada's top life and critical illness policies.", url: "/insurance", type: "insight" },
  { title: "Start Your Own Business in Canada", snippet: "Turn your skills into a thriving business.", url: "/blog", type: "insight" },
  { title: "Disability & Income Protection", snippet: "If you can't work due to illness or injury.", url: "/insurance", type: "insight" },
  { title: "Franchise & Side-Hustle Opportunities", snippet: "Explore proven franchise models.", url: "/blog", type: "insight" },
  { title: "Business Mentorship Program", snippet: "Get paired with an experienced entrepreneur.", url: "/about", type: "insight" },
  { title: "Business Insurance & Liability", snippet: "Protect your business from lawsuits.", url: "/insurance", type: "insight" },
];

export default searchIndex;
