import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "@/lib/api";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Home,
  Shield,
  UserRound,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import type { DashboardSearchItem } from "@/components/dashboard/ClientDashboardSearch";
import { localStore as ls } from "@/features/dashboard/shared/localStore";
import { buildClientSearchItems } from "./buildClientSearchItems";

export function useClientDashboardState(user: any, stats: any, onBook: () => void) {
  const navigate = useNavigate();
  const [actionTab, setActionTab] = useState<"book" | "rent" | "insure" | "wealth">("book");
  const userKey = user?._id || user?.email || "guest";

  const readinessItems = [
    { id: "id", label: "Government-issued ID ready" },
    { id: "income", label: "Proof of income or employment letter" },
    { id: "references", label: "Two personal or professional references" },
    { id: "budget", label: "Monthly rent budget decided" },
    { id: "areas", label: "Preferred cities or neighbourhoods listed" },
    { id: "deposit", label: "First/last month deposit plan" },
  ];
  const [readiness, setReadiness] = useState<Record<string, boolean>>(() => ls.get(`fswg:readiness:${userKey}`, {}));
  useEffect(() => { ls.set(`fswg:readiness:${userKey}`, readiness); }, [readiness, userKey]);
  const readinessPct = Math.round((readinessItems.filter((i) => readiness[i.id]).length / readinessItems.length) * 100);

  const [monthlySave, setMonthlySave] = useState(200);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(6);
  const wealthFuture = useMemo(() => {
    const r = rate / 100 / 12;
    const n = years * 12;
    if (r === 0) return monthlySave * n;
    return monthlySave * ((Math.pow(1 + r, n) - 1) / r);
  }, [monthlySave, years, rate]);

  const insuranceOptions = [
    { id: "life", label: "Life protection", desc: "Support loved ones financially" },
    { id: "health", label: "Health & critical illness", desc: "Coverage beyond public care" },
    { id: "disability", label: "Income protection", desc: "If you cannot work for a while" },
    { id: "family", label: "Family package", desc: "Bundled guidance for households" },
  ];
  const [insurancePick, setInsurancePick] = useState<string[]>(() => ls.get(`fswg:insurance:${userKey}`, []));
  useEffect(() => { ls.set(`fswg:insurance:${userKey}`, insurancePick); }, [insurancePick, userKey]);

  const prepItems = [
    { id: "questions", label: "Write 3–5 questions for your advisor" },
    { id: "docs", label: "Gather income and ID documents" },
    { id: "goals", label: "Note your top financial or housing goals" },
    { id: "quiet", label: "Book a quiet space and stable connection" },
    { id: "timeline", label: "Share your ideal timeline (rent / insure / save)" },
  ];
  const [prep, setPrep] = useState<Record<string, boolean>>(() => ls.get(`fswg:prep:${userKey}`, {}));
  useEffect(() => { ls.set(`fswg:prep:${userKey}`, prep); }, [prep, userKey]);

  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => {
    api.get("/content", { params: { type: "blog", published: "true", limit: 4 } })
      .then((res) => {
        const list = res.data?.content || [];
        setPosts(Array.isArray(list) ? list.slice(0, 4) : []);
      })
      .catch(() => setPosts([]));
  }, []);

  const docItems = [
    { id: "passport", label: "Passport or PR / work permit" },
    { id: "sin", label: "SIN (if available)" },
    { id: "paystubs", label: "Recent pay stubs or bank statements" },
    { id: "lease", label: "Current or prior lease (if any)" },
    { id: "letter", label: "Employment or school enrolment letter" },
  ];
  const [docs, setDocs] = useState<Record<string, boolean>>(() => ls.get(`fswg:docs:${userKey}`, {}));
  useEffect(() => { ls.set(`fswg:docs:${userKey}`, docs); }, [docs, userKey]);

  const goalOptions = [
    { id: "rent", label: "Secure a rental", icon: Home },
    { id: "insure", label: "Get insurance guidance", icon: Shield },
    { id: "save", label: "Build savings habits", icon: Wallet },
    { id: "advise", label: "Explore advisor career", icon: UserRound },
    { id: "learn", label: "Learn Canada money basics", icon: BookOpen },
  ];
  const [goals, setGoals] = useState<string[]>(() => ls.get(`fswg:goals:${userKey}`, ["rent", "save"]));
  useEffect(() => { ls.set(`fswg:goals:${userKey}`, goals); }, [goals, userKey]);

  const journey = [
    { id: "consult", label: "Consultation", done: (stats.totalConsultations || 0) > 0 || (stats.upcomingConsultations || 0) > 0, href: "/bookings" },
    { id: "rental", label: "Rental support", done: (stats.myApplications || 0) > 0, href: "/rental-applications" },
    { id: "insurance", label: "Insurance path", done: insurancePick.length > 0, href: "/app/insurance-planner" },
    { id: "wealth", label: "Wealth plan", done: goals.includes("save"), href: "/app/wealth-studio" },
    { id: "network", label: "Messages", done: goals.includes("advise"), href: "/app/messages" },
  ];
  const journeyPct = Math.round((journey.filter((j) => j.done).length / journey.length) * 100);

  const statusData = (stats.applicationStatuses || []).map((item: any) => ({
    name: String(item._id || "unknown").replace(/_/g, " "),
    count: item.count,
  }));

  const snapshotCards = [
    { key: "apps", label: "Applications", value: stats.myApplications || 0, sub: "Rental guarantee", icon: FileText, accent: true, onClick: () => navigate("/rental-applications") },
    { key: "upcoming", label: "Upcoming", value: stats.upcomingConsultations || 0, sub: "Consultations", icon: Calendar, onClick: () => navigate("/bookings") },
    { key: "total", label: "Total booked", value: stats.totalConsultations || 0, sub: "All consultations", icon: CheckCircle2, onClick: () => navigate("/bookings") },
    { key: "next", label: "Next appointment", value: stats.nextAppointment ? "Scheduled" : "None yet", sub: stats.nextAppointment || "Book when you are ready", icon: Clock, onClick: () => navigate("/bookings"), wide: true },
  ];

  const actionContent = {
    book: { title: "Book a consultation", body: "Schedule a free discovery call with an advisor.", cta: "Book now", run: onBook },
    rent: { title: "Rental support", body: "Submit or track your rental guarantee application.", cta: "Open applications", run: () => navigate("/rental-applications") },
    insure: { title: "Insurance path", body: "Explore coverage guidance or joining the advisor network.", cta: "View insurance", run: () => navigate("/app/insurance-planner") },
    wealth: { title: "Wealth studio", body: "Model savings growth inside your client hub.", cta: "Open Wealth Studio", run: () => navigate("/app/wealth-studio") },
  }[actionTab];

  const resources = [
    { title: "Messages", href: "/app/messages", blurb: "Chat with your advisor without leaving the hub." },
    { title: "Video rooms", href: "/app/video", blurb: "Join a private consultation call in-app." },
    { title: "Document vault", href: "/app/documents", blurb: "Upload ID and income files for applications." },
    { title: "Wealth studio", href: "/app/wealth-studio", blurb: "Model savings growth inside the client hub." },
    { title: "Insurance planner", href: "/app/insurance-planner", blurb: "Capture coverage interests for your next call." },
    { title: "Housing preferences", href: "/app/housing", blurb: "Save cities, budget, and move-in timing." },
  ];

  const shareReferral = async () => {
    const url = window.location.origin;
    const text = "I am building my financial first steps with First Step Wealth Group. Explore rentals, insurance, and wealth guidance:";
    try {
      if (navigator.share) await navigator.share({ title: "First Step Wealth Group", text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Referral link copied");
      }
    } catch { /* cancelled */ }
  };

  const toggleList = (list: string[], setList: (v: string[]) => void, id: string) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const searchItems = useMemo<DashboardSearchItem[]>(
    () => buildClientSearchItems({ onBook, posts, stats }),
    [onBook, posts, stats.myApplications, stats.upcomingConsultations],
  );

  return {
    navigate, actionTab, setActionTab, readinessItems, readiness, setReadiness, readinessPct,
    monthlySave, setMonthlySave, years, setYears, rate, setRate, wealthFuture,
    insuranceOptions, insurancePick, setInsurancePick, prepItems, prep, setPrep, posts,
    docItems, docs, setDocs, goalOptions, goals, setGoals, journey, journeyPct, statusData,
    snapshotCards, actionContent, resources, shareReferral, toggleList, searchItems,
  };
}
