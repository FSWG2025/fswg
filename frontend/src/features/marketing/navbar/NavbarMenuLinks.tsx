import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowRight, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router";
import { mainLinks, servicesLinks, educationLinks } from "./navLinks";
import { buildLocationKey, withReturnTo } from "@/lib/authReturnTo";

type Props = {
  animated: boolean;
  isMobile: boolean;
  /** Soft frosted rows for the mobile hero-style sheet only */
  heroTone?: boolean;
  user: unknown;
  servicesOpen: boolean;
  educationOpen: boolean;
  setServicesOpen: (v: boolean) => void;
  setEducationOpen: (v: boolean) => void;
  closeMenu: () => void;
  handleFaqClick: (e: React.MouseEvent) => void;
  handleBookCall: () => void;
};

export default function NavbarMenuLinks({
  animated,
  isMobile,
  heroTone = false,
  user,
  servicesOpen,
  educationOpen,
  setServicesOpen,
  setEducationOpen,
  closeMenu,
  handleFaqClick,
  handleBookCall,
}: Props) {
  const location = useLocation();
  const loginHref = withReturnTo(
    "/login",
    buildLocationKey(location.pathname, location.search, location.hash),
  );

  const servicesIndex = mainLinks.length;
  const educationIndex = servicesIndex + 1;
  const faqIndex = educationIndex + 1;
  const signInIndex = faqIndex + 1;
  const bookIndex = user ? faqIndex + 1 : signInIndex + 1;
  const menuRowCount = bookIndex + 1;

  const rowMotion = (index: number) => ({
    initial: { opacity: 0, y: isMobile ? 28 : 0, x: isMobile ? 0 : 16 },
    animate: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.28, delay: (menuRowCount - 1 - index) * 0.04 },
    },
    exit: {
      opacity: 0,
      y: isMobile ? 24 : 0,
      x: isMobile ? 0 : 12,
      transition: { duration: 0.18, delay: index * 0.04 },
    },
  });

  const itemClass = (active = false) =>
    heroTone
      ? `group flex items-center justify-between rounded-xl border border-white/70 bg-white/75 px-3.5 py-2.5 text-[15px] font-semibold text-[#12213E] shadow-[0_6px_18px_rgba(18,33,62,0.05)] backdrop-blur-sm transition hover:bg-white ${
          active ? "ring-1 ring-[#C69259]/35" : ""
        }`
      : `group flex items-center justify-between rounded-xl px-4 py-3 text-lg font-semibold text-[#12213E] transition-colors hover:bg-[#12213E]/5 ${
          active ? "bg-[#12213E]/5" : ""
        }`;

  const subLinkClass = heroTone
    ? "block rounded-lg bg-white/55 px-3.5 py-2 text-sm font-medium text-[#12213E]/75 transition-colors hover:bg-white hover:text-[#C69259]"
    : "block px-4 py-2 text-base font-medium text-[#12213E]/70 transition-colors hover:text-[#C69259]";

  return (
    <div className={`mt-1 flex flex-col ${heroTone ? "gap-1.5" : "gap-2"}`}>
      {mainLinks.map((link, i) => {
        const content = (
          <Link
            to={link.href}
            onClick={closeMenu}
            className={itemClass(location.pathname === link.href)}
          >
            {link.label}
            <ArrowUpRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-[#C69259]" />
          </Link>
        );
        return animated ? (
          <motion.div key={link.label} {...rowMotion(i)}>
            {content}
          </motion.div>
        ) : (
          <div key={link.label}>{content}</div>
        );
      })}

      <motion.div {...(animated ? rowMotion(servicesIndex) : {})}>
        <button
          type="button"
          onClick={() => setServicesOpen(!servicesOpen)}
          className={`w-full ${itemClass()}`}
        >
          Services
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence>
          {servicesOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`mt-1.5 space-y-1 overflow-hidden ${heroTone ? "pl-1" : "pl-4"}`}
            >
              {servicesLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={closeMenu}
                  className={subLinkClass}
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div {...(animated ? rowMotion(educationIndex) : {})}>
        <button
          type="button"
          onClick={() => setEducationOpen(!educationOpen)}
          className={`w-full ${itemClass()}`}
        >
          Education
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform ${educationOpen ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence>
          {educationOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`mt-1.5 space-y-1 overflow-hidden ${heroTone ? "pl-1" : "pl-4"}`}
            >
              {educationLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={closeMenu}
                  className={subLinkClass}
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div {...(animated ? rowMotion(faqIndex) : {})}>
        <button
          type="button"
          onClick={handleFaqClick}
          className={`w-full ${itemClass()}`}
        >
          FAQ
          <ArrowUpRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-[#C69259]" />
        </button>
      </motion.div>

      {!user && (
        <motion.div {...(animated ? rowMotion(signInIndex) : {})}>
          <Link to={loginHref} onClick={closeMenu} className="cta-email w-full">
            <span className="min-w-0 flex-1 whitespace-nowrap">Sign In</span>
            <span className="cta-email-arrow">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </motion.div>
      )}
      <motion.div {...(animated ? rowMotion(bookIndex) : {})}>
        <button
          type="button"
          onClick={() => {
            handleBookCall();
            closeMenu();
          }}
          className="cta-email w-full"
        >
          <span className="min-w-0 flex-1 whitespace-nowrap">
            {user ? "Dashboard" : "Book a Call"}
          </span>
          <span className="cta-email-arrow">
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </motion.div>
    </div>
  );
}

export function useMenuRowCount(user: unknown) {
  const servicesIndex = mainLinks.length;
  const educationIndex = servicesIndex + 1;
  const faqIndex = educationIndex + 1;
  const signInIndex = faqIndex + 1;
  const bookIndex = user ? faqIndex + 1 : signInIndex + 1;
  return bookIndex + 1;
}
