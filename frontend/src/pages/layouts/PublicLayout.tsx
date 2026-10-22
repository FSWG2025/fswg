import { useLayoutEffect, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import FAQSection from "@/components/home/FAQSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import { rememberPublicLocation } from "@/lib/authReturnTo";
import MaintenanceBanner from "@/features/super-admin/MaintenanceBanner";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        window.scrollTo(0, 0);
      });
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

const PublicLayout = () => {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    AOS.init({
      duration: 450,
      easing: "ease-out-cubic",
      once: true,
      offset: 24,
      delay: 0,
      mirror: false,
      anchorPlacement: "top-bottom",
      disable: () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  }, []);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => AOS.refreshHard());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Remember last public page/section so auth can send users back.
  useEffect(() => {
    rememberPublicLocation(pathname, search, hash);
  }, [pathname, search, hash]);

  useEffect(() => {
    const onHash = () => {
      rememberPublicLocation(
        window.location.pathname,
        window.location.search,
        window.location.hash,
      );
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div className="min-h-screen bg-[#E4EFF8] font-sans">
      <ScrollToTop />
      <MaintenanceBanner />
      <Navbar />
      <Outlet />
      <FAQSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default PublicLayout;
