export const WHATSAPP_NUMBER = "+19055192873";
export const WHATSAPP_MESSAGE =
  "Hi! I'm interested in rental support from First Step Wealth Group. Can you help me get started?";

export const openWhatsApp = (message?: string) => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message || WHATSAPP_MESSAGE)}`;
  window.open(url, "_blank");
};

export const programCards = [
  {
    id: "problem",
    title: "The Problem",
    description:
      "Starting a new life in Canada is already overwhelming. But for many newcomers, one major obstacle appears immediately: they don't yet have a Canadian credit history.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80",
    color: "bg-[#F5F5F5]",
    featured: false,
  },
  {
    id: "solution",
    title: "Our Guarantee",
    description:
      "We help remove one of the biggest barriers newcomers face when trying to rent in Canada. Instead of asking you to pay 6 to 12 months of rent upfront, we step in as your trusted rental guarantor.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80",
    color: "bg-[#C3B1E1]",
    featured: true,
    author: {
      name: "Adaeze O.",
      role: "Approved in less than 8 days",
      avatar: "https://i.pravatar.cc/150?img=47",
    },
  },
  {
    id: "get-started",
    title: "Get Started Today",
    description:
      "Skip the huge deposit, get approved fast, and start building your Canadian credit. It only takes 5 minutes.",
    sub: "Apply Now →",
    color: "bg-[#FFFBF5]",
    featured: false,
  },
  {
    id: "landlord",
    title: "For Landlords",
    description:
      "Fill vacancies faster with guaranteed tenants. We handle screening and payments, zero risk of arrears.",
    sub: "Partner with us →",
    color: "bg-[#F5F5F5]",
    featured: false,
  },
];

export type ModalType = "problem" | "solution" | "renter" | "landlord" | "general";

