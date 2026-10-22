import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Mic, ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { useMediaQuery, breakpoints } from "@/hooks/useMediaQuery";
import LeadCaptureModal from "@/components/global/LeadCaptureModal";
import { mainLinks, servicesLinks } from "@/features/marketing/navbar/navLinks";
import NavbarMenuLinks, { useMenuRowCount } from "@/features/marketing/navbar/NavbarMenuLinks";
import NavbarVoiceAskModal from "@/features/marketing/navbar/NavbarVoiceAskModal";
import type { SiteSearchHit } from "@/lib/siteSearch";
import {
  buildLocationKey,
  sanitizeAppPath,
  withReturnTo,
} from "@/lib/authReturnTo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [voiceAskOpen, setVoiceAskOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [educationOpen, setEducationOpen] = useState(false);
  const [desktopServicesOpen, setDesktopServicesOpen] = useState(false);
  const prevScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const loginHref = withReturnTo(
    "/login",
    buildLocationKey(location.pathname, location.search, location.hash),
  );

  const isMd = useMediaQuery(breakpoints.md);
  const isLg = useMediaQuery(breakpoints.lg);
  const isMobile = !isMd;
  const useSidebarMenu = isMd && !isLg;

  // Smart hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > prevScrollY.current && currentScrollY > 80) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      prevScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when overlays open
  useEffect(() => {
    if (isOpen || voiceAskOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, voiceAskOpen]);

  // Close overlay menu when switching to desktop inline nav
  useEffect(() => {
    if (isLg) setIsOpen(false);
  }, [isLg]);

  const handleRelatedSelect = (result: SiteSearchHit) => {
    setVoiceAskOpen(false);
    const url = result.url;
    if (!url) return;
    const safe = sanitizeAppPath(url.split("#")[0]);
    if (!safe) return;
    const hash = url.includes("#") ? url.slice(url.indexOf("#")) : "";
    const target = `${safe}${hash}`;

    if (result.sectionId && hash) {
      navigate(target);
      return;
    }
    if (result.sectionId) {
      navigate(safe);
      requestAnimationFrame(() => {
        document
          .getElementById(result.sectionId!)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    navigate(target);
  };

  const handleBookCall = () => {
    if (user) navigate("/dashboard");
    else setLeadModalOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setServicesOpen(false);
    setEducationOpen(false);
  };

  const handleFaqClick = (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
    const el = document.getElementById("faq");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate("/#faq");
  };

  const menuRowCount = useMenuRowCount(user);

  const linkClass = (href: string) =>
    `text-sm font-semibold transition-colors hover:text-[#C69259] ${
      location.pathname === href ? "text-[#C69259]" : "text-[#12213E]"
    }`;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 z-40 flex w-full justify-center pt-4 transition-transform duration-300 sm:pt-6 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex w-[95%] max-w-6xl items-center justify-between rounded-full border border-[#12213E]/10 bg-white/80 px-4 py-3 shadow-[0_8px_30px_rgba(18,33,62,0.06)] backdrop-blur-xl sm:px-6">
          <Link to="/" className="group flex shrink-0 items-center space-x-2">
            <div className="relative h-9 w-9 overflow-hidden rounded-full shadow-sm transition-shadow group-hover:shadow-md">
              <img src="/fswgLogo.jpg" alt="FSWG" className="h-full w-full object-cover" />
            </div>
            <span className="hidden text-sm font-bold tracking-tight text-[#12213E] sm:inline">
              First Step <span className="text-[#C69259]">Wealth</span>
            </span>
          </Link>

          {/* Desktop inline nav */}
          <div className="hidden items-center gap-5 lg:flex">
            {mainLinks.map((link) => (
              <Link key={link.href} to={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}

            <div
              className="relative"
              onMouseEnter={() => setDesktopServicesOpen(true)}
              onMouseLeave={() => setDesktopServicesOpen(false)}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#12213E] transition-colors hover:text-[#C69259]"
                onClick={() => setDesktopServicesOpen((v) => !v)}
              >
                Services
                <ChevronDown className={`h-4 w-4 transition-transform ${desktopServicesOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {desktopServicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-1/2 top-full z-50 mt-3 w-56 -translate-x-1/2 rounded-2xl border border-[#12213E]/08 bg-white p-2 shadow-[0_16px_40px_rgba(18,33,62,0.12)]"
                  >
                    {servicesLinks.map((link) => (
                      <Link
                        key={link.label}
                        to={link.href}
                        className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#12213E] transition-colors hover:bg-[#E4EFF8] hover:text-[#C69259]"
                        onClick={() => setDesktopServicesOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/wealth" className={linkClass("/wealth")}>
              Wealth
            </Link>
            <Link to="/blog" className={linkClass("/blog")}>
              Blog
            </Link>
            <button
              type="button"
              onClick={handleFaqClick}
              className="text-sm font-semibold text-[#12213E] transition-colors hover:text-[#C69259]"
            >
              FAQ
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setVoiceAskOpen(true)}
              className="rounded-full p-2 text-[#12213E] transition-colors hover:bg-[#12213E]/5"
              aria-label="Ask with your voice"
              title="Ask with your voice"
            >
              <Mic className="h-5 w-5" />
            </button>
            {!user && (
              <Link to={loginHref} className="cta-email hidden sm:inline-flex">
                <span className="whitespace-nowrap">Sign In</span>
                <span className="cta-email-arrow">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            )}
            <button onClick={handleBookCall} className="cta-email hidden sm:inline-flex">
              <span className="whitespace-nowrap">{user ? "Dashboard" : "Book a Call"}</span>
              <span className="cta-email-arrow">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
            {/* Hamburger: mobile + tablet only */}
            <button
              onClick={() => setIsOpen(true)}
              className="rounded-full p-2 text-[#12213E] transition-colors hover:bg-[#12213E]/5 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <NavbarVoiceAskModal
        open={voiceAskOpen}
        onClose={() => setVoiceAskOpen(false)}
        onSelectRelated={handleRelatedSelect}
      />

      {/* Mobile bottom sheet / Tablet sidebar */}
      <AnimatePresence>
        {isOpen && !isLg && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: [1, 1, 0] }}
            transition={{ duration: (menuRowCount - 1) * 0.04 + 0.53, times: [0, 0.92, 1] }}
          >
            <motion.button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.35 } }}
              exit={{
                opacity: 0,
                transition: { duration: 0.35, delay: (menuRowCount - 1) * 0.04 + 0.18 },
              }}
              onClick={closeMenu}
            />

            {isMobile ? (
              <motion.div
                role="dialog"
                aria-label="Navigate"
                initial={{ y: "100%" }}
                animate={{ y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                exit={{
                  y: "100%",
                  transition: {
                    duration: 0.35,
                    ease: [0.4, 0, 1, 1],
                    delay: (menuRowCount - 1) * 0.04 + 0.18,
                  },
                }}
                className="absolute inset-x-0 bottom-0 flex max-h-[min(68vh,520px)] flex-col overflow-hidden rounded-t-[28px] shadow-[0_-20px_60px_rgba(18,33,62,0.22)]"
                style={{
                  background:
                    "radial-gradient(ellipse 90% 70% at 12% 8%, rgba(198,146,89,0.22), transparent 52%), radial-gradient(ellipse 80% 55% at 92% 88%, rgba(18,33,62,0.10), transparent 50%), linear-gradient(165deg, #E4EFF6 0%, #EEF2F6 48%, #F3DFC7 140%)",
                }}
              >
                {/* Hero-style atmosphere: mobile only */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-16 top-10 h-32 w-32 rounded-full bg-[#C69259]/20 blur-3xl"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 bottom-16 h-36 w-36 rounded-full bg-[#12213E]/10 blur-3xl"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
                />

                <div className="relative mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-[#12213E]/18" />
                <div className="relative flex shrink-0 items-center justify-between px-4 pb-1.5 pt-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-[#C69259]/50 bg-white shadow-sm">
                      <img
                        src="/fswgLogo.jpg"
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C69259]">
                      First Step
                    </p>
                  </div>
                  <button
                    onClick={closeMenu}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#12213E] shadow-sm ring-1 ring-white/70 transition hover:bg-white"
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5 pb-6 pt-1">
                  <NavbarMenuLinks
                    animated
                    isMobile={isMobile}
                    heroTone
                    user={user}
                    servicesOpen={servicesOpen}
                    educationOpen={educationOpen}
                    setServicesOpen={setServicesOpen}
                    setEducationOpen={setEducationOpen}
                    closeMenu={closeMenu}
                    handleFaqClick={handleFaqClick}
                    handleBookCall={handleBookCall}
                  />
                </div>
              </motion.div>
            ) : useSidebarMenu ? (
              <motion.div
                role="dialog"
                aria-label="Navigate"
                initial={{ x: "100%" }}
                animate={{ x: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } }}
                exit={{
                  x: "100%",
                  transition: {
                    duration: 0.32,
                    ease: [0.4, 0, 1, 1],
                    delay: (menuRowCount - 1) * 0.03 + 0.12,
                  },
                }}
                className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-hidden bg-white shadow-[-16px_0_50px_rgba(18,33,62,0.18)]"
              >
                <div className="flex items-center justify-between border-b border-[#12213E]/06 px-6 py-5">
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#12213E]">Navigate</h3>
                    <p className="mt-1 text-sm text-gray-500">Browse pages and services.</p>
                  </div>
                  <button
                    onClick={closeMenu}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4 pb-8">
                  <NavbarMenuLinks
                    animated
                    isMobile={isMobile}
                    user={user}
                    servicesOpen={servicesOpen}
                    educationOpen={educationOpen}
                    setServicesOpen={setServicesOpen}
                    setEducationOpen={setEducationOpen}
                    closeMenu={closeMenu}
                    handleFaqClick={handleFaqClick}
                    handleBookCall={handleBookCall}
                  />
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <LeadCaptureModal isOpen={leadModalOpen} onClose={() => setLeadModalOpen(false)} />
    </>
  );
};

export default Navbar;
