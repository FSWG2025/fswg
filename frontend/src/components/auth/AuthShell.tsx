import type { ReactNode } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import {
  authReturnLabel,
  resolveAuthReturnTo,
} from "@/lib/authReturnTo";

type Props = {
  children: ReactNode;
  title: string;
  subtitle: string;
  panelTitle?: string;
  panelBody?: string;
};

/** Shared split layout for login / register / forgot password */
export default function AuthShell({
  children,
  title,
  subtitle,
  panelTitle = "First Step Wealth Group",
  panelBody = "Rentals, insurance, and wealth guidance: one client hub for newcomers building their life in Canada.",
}: Props) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const returnTo = resolveAuthReturnTo({
    fromParam: searchParams.get("from"),
    stateFrom: (location.state as { from?: unknown } | null)?.from,
  });
  const backLabel = authReturnLabel(returnTo);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#EEF2F6]">
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 10% 20%, rgba(198,146,89,0.12), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, rgba(18,33,62,0.08), transparent 50%), linear-gradient(180deg, #EEF2F6 0%, #E4EFF6 100%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-[98%] max-w-none items-center px-0 py-4 sm:w-full sm:max-w-[460px] sm:px-4 sm:py-8 md:max-w-[480px] lg:max-w-6xl lg:px-6 lg:py-12">
        <div className="grid w-full overflow-hidden rounded-[22px] border border-[#E5EAF0] bg-white shadow-[0_24px_64px_rgba(18,33,62,0.10)] sm:rounded-[28px] lg:grid-cols-2">
          {/* Brand panel */}
          <motion.aside
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="relative hidden overflow-hidden bg-[#12213E] p-10 text-white lg:flex lg:flex-col lg:justify-between"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(circle at 20% 30%, rgba(198,146,89,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(232,245,200,0.12), transparent 40%)",
              }}
            />
            <div className="relative">
              <Link to={returnTo} className="inline-flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-[#C69259] shadow-lg">
                  <img
                    src="/fswgLogo.jpg"
                    alt="FSWG"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-sm font-bold tracking-wide text-white/90">
                  FSWG
                </span>
              </Link>
              <h2 className="mt-14 max-w-sm text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">
                {panelTitle}
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
                {panelBody}
              </p>
            </div>
            <div className="relative space-y-6">
              <ul className="space-y-3 text-sm text-white/70">
                {[
                  "Secure client messaging & video rooms",
                  "Rental guarantee applications in-app",
                  "Wealth studio & insurance planning tools",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C69259]" />
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                to={returnTo}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Link>
            </div>
          </motion.aside>

          {/* Form panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="relative flex flex-col justify-center px-4 py-5 sm:px-7 sm:py-10 lg:px-10 lg:py-12"
          >
            <div className="mx-auto w-full max-w-none sm:max-w-[380px] lg:mx-0 lg:max-w-md">
              <Link
                to={returnTo}
                className="mb-5 inline-flex items-center gap-2 lg:hidden"
              >
                <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-[#C69259] sm:h-10 sm:w-10">
                  <img
                    src="/fswgLogo.jpg"
                    alt="FSWG"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-[#12213E] sm:text-sm">
                  First Step Wealth Group
                </span>
              </Link>

              <h1 className="text-xl font-extrabold tracking-tight text-[#12213E] sm:text-[1.65rem] lg:text-3xl">
                {title}
              </h1>
              <p className="mt-1 text-xs leading-snug text-[#6B7280] sm:mt-2 sm:text-sm sm:leading-relaxed">
                {subtitle}
              </p>

              <div className="mt-4 sm:mt-7 lg:mt-8">{children}</div>

              <div className="mt-6 border-t border-[#E5EAF0] pt-5 sm:mt-8 sm:pt-6">
                <Link
                  to={returnTo}
                  className="mx-auto flex w-fit items-center justify-center gap-1.5 text-sm font-semibold text-[#6B7280] transition hover:text-[#12213E]"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  {backLabel}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export const authFieldClass =
  "w-full rounded-full border border-[#E5EAF0] bg-[#F4F6F8] px-4 py-3 text-sm text-[#12213E] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#C69259]/55 focus:bg-white focus:shadow-[0_0_0_3px_rgba(198,146,89,0.12)] sm:px-5 sm:py-3.5";

export const authPrimaryBtnClass =
  "group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#12213E] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(18,33,62,0.18)] transition hover:bg-[#0D1A2E] active:scale-[0.99] disabled:opacity-50 sm:px-6 sm:py-3.5";
