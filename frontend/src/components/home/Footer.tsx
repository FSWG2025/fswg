import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import {
  ArrowUp,
  ArrowRight,
  Mail,
  Phone,
  X,
  Navigation,
  ArrowUpRight,
  Linkedin,
  Instagram,
  Facebook,
  ChevronRight,
  Quote,
} from "lucide-react";
import {
  QuickRegisterModal,
  PolicyModal,
  SocialModal,
} from "@/features/marketing/footer/FooterModals";

const navPages = [
  { path: "/", label: "Home" },
  { path: "/rental-guarantee", label: "Rental Guarantee" },
  { path: "/insurance", label: "Insurance & Advisor" },
  { path: "/real-estate", label: "Real Estate" },
  { path: "/wealth", label: "Wealth Calculator" },
  { path: "/about", label: "About Us" },
  { path: "/testimonials", label: "Testimonials" },
  { path: "/#faq", label: "FAQ" },
  { path: "/services", label: "All Services" },
  { path: "/blog", label: "Blog" },
];

const Footer = () => {
  const [navModalOpen, setNavModalOpen] = useState(false);
  const [policyModalType, setPolicyModalType] = useState<"privacy" | "terms" | "legal" | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [socialModalOpen, setSocialModalOpen] = useState(false);

  const openPolicy = (type: "privacy" | "terms" | "legal") => setPolicyModalType(type);

  const footerLinks: Record<string, { label: string; path: string }[]> = {
    Company: [
      { label: "About Us", path: "/about" },
      { label: "Our Services", path: "/services" },
      { label: "Community Impact", path: "/about" },
      { label: "Testimonials", path: "/testimonials" },
    ],
    Support: [
      { label: "Help Center", path: "/#faq" },
      { label: "Contact Us", path: "/#cta" },
      { label: "FAQs", path: "/#faq" },
      { label: "Book a Consultation", path: "/" },
    ],
    "Quick Links": [
      { label: "Blog", path: "/blog" },
      { label: "Join Our Network", path: "/join-network" },
      { label: "Rental Support", path: "/rental-guarantee" },
      { label: "Get Insurance", path: "/insurance" },
    ],
  };

  const renderLinkList = (title: string, items: { label: string; path: string }[]) => (
    <div>
      <h4 className="font-bold text-[#12213E] mb-4 text-lg">{title}</h4>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              to={item.path}
              className="text-[#475569] hover:text-[#C69259] transition-colors text-sm inline-flex items-center gap-1 group"
            >
              {item.label}
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#C69259]" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="relative bg-[#E4EFF8] pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ─── Top Section: Brand + Link Columns ──────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="bg-[#12213E] w-9 h-9 flex items-center justify-center rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                  <span className="text-[#C69259] font-extrabold text-base leading-none">F</span>
                </div>
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#12213E]">
                First Step <span className="text-[#C69259]">Wealth</span>
              </span>
            </Link>
            <p className="text-[#475569] leading-relaxed text-sm">
              Empowering newcomers and families through financial education, rental
              support, insurance strategies, and wealth‑building opportunities across Canada.
            </p>

            {/* Social Media Links: Twitter & YouTube removed, modal on click */}
            <div className="flex space-x-3 pt-2">
              {[
                { icon: Linkedin, label: "LinkedIn" },
                { icon: Instagram, label: "Instagram" },
                { icon: Facebook, label: "Facebook" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={() => setSocialModalOpen(true)}
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#C69259] hover:text-white transition-all text-[#475569] hover:shadow-md"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {renderLinkList("Company", footerLinks.Company)}
            {renderLinkList("Support", footerLinks.Support)}
            {renderLinkList("Quick Links", footerLinks["Quick Links"])}
          </div>
        </div>

        {/* ─── Motivational Quote Section ────────────────── */}
        <div className="mt-12 bg-[#12213E] rounded-3xl px-6 py-8 sm:px-10 sm:py-12 shadow-lg relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C69259]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#C69259]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col items-center text-center max-w-3xl mx-auto space-y-5 sm:space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-[#C69259] opacity-50" />
            </motion.div>

            <motion.blockquote
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-relaxed tracking-wide"
            >
              "The best time to plant a tree was{" "}
              <span className="text-[#C69259]">20 years ago</span>.{" "}
              The second best time is{" "}
              <span className="text-[#C69259]">now</span>."
            </motion.blockquote>

            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/60 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed"
            >
              Every financial journey begins with a single step. Whether you're new to
              Canada or building your family's future, start today, and let tomorrow
              thank you.
            </motion.p>

            {/* 🔥 RESPONSIVE CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onClick={() => setRegisterModalOpen(true)}
              className="cta-email"
            >
              <span className="whitespace-nowrap">Take Your First Step Today</span>
              <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
            </motion.button>

            {/* Contact info, Updated email */}
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 pt-2 text-xs sm:text-sm text-white/50"
            >
              <a href="tel:+1 (905) 519-2873" className="flex items-center gap-1.5 hover:text-[#C69259] transition-colors">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />+1 (905) 519-2873
              </a>
              <a href="mailto:firststepwealthgroup@gmail.com" className="flex items-center gap-1.5 hover:text-[#C69259] transition-colors">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />firststepwealthgroup@gmail.com
              </a>
            </motion.div>
          </div>
        </div>

        {/* ─── Legal Bar ──────────────────────────────── */}
        <div className="border-t border-gray-100 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-[#475569]">
          <p>© {new Date().getFullYear()} First Step Wealth Group. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button onClick={() => openPolicy("privacy")} className="hover:text-[#C69259] transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => openPolicy("terms")} className="hover:text-[#C69259] transition-colors cursor-pointer">Terms of Use</button>
            <button onClick={() => openPolicy("legal")} className="hover:text-[#C69259] transition-colors cursor-pointer">Legal</button>
            <a href="#" className="hover:text-[#C69259] transition-colors">Site Map</a>
          </div>
          <button onClick={() => setNavModalOpen(true)}
            className="mt-6 md:mt-0 p-3 rounded-full bg-gray-100 hover:bg-[#C69259] hover:text-white transition-all group shadow-sm">
            <ArrowUp className="w-4 h-4 text-[#475569] group-hover:text-white" />
          </button>
        </div>

        {/* ─── Built by TOBE ────────────────────────────── */}
        <div className="mt-4 text-center">
          <a href="https://tobeio.vercel.app" target="_blank" rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-[#C69259] transition-colors">
            built by <span className="font-semibold">TOBE</span>
          </a>
        </div>
      </div>

      {/* ─── Navigation Modal ──────────────────────────── */}
      <AnimatePresence>
        {navModalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNavModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center relative overflow-hidden">
              <button onClick={() => setNavModalOpen(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><X className="w-5 h-5 text-gray-600" /></button>
              <div className="flex justify-center mb-6"><div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C69259] to-[#D4A96A] flex items-center justify-center shadow-lg"><Navigation className="w-7 h-7 text-white" /></div></div>
              <h3 className="text-xl font-extrabold text-[#12213E] mb-2">Browse Pages</h3>
              <p className="text-sm text-gray-500 mb-6">Select a page to navigate.</p>
              <div className="space-y-2 text-left max-h-[50vh] overflow-y-auto">
                {navPages.map((page) => (
                  <Link
                    key={page.path}
                    to={page.path}
                    onClick={() => setNavModalOpen(false)}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#C69259]/5 transition-colors text-[#12213E] font-medium text-sm flex items-center justify-between group"
                  >
                    {page.label}
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#C69259] transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Policy Modal ──────────────────────────────── */}
      <PolicyModal isOpen={!!policyModalType} onClose={() => setPolicyModalType(null)} type={policyModalType} />

      {/* ─── Quick Register Modal ──────────────────────── */}
      <QuickRegisterModal isOpen={registerModalOpen} onClose={() => setRegisterModalOpen(false)} />

      {/* ─── Social Maintenance Modal ──────────────────── */}
      <SocialModal isOpen={socialModalOpen} onClose={() => setSocialModalOpen(false)} />
    </footer>
  );
};

export default Footer;