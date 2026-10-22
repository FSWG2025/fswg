import { useAuth } from "@/hooks/AuthProvider";
import { Navigate, Outlet, useLocation } from "react-router";
import { Loader2 } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { NotificationsProvider } from "@/hooks/NotificationsProvider";
import { readRememberedPublicLocation, withReturnTo } from "@/lib/authReturnTo";
import ImpersonationBanner from "@/features/super-admin/ImpersonationBanner";

const PrivateRoutes = () => {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C69259]" />
      </div>
    );
  }

  if (!user) {
    const from =
      readRememberedPublicLocation() ||
      `${location.pathname}${location.search}${location.hash}`;
    return (
      <Navigate
        to={withReturnTo("/login", from)}
        replace
        state={{ from: location }}
      />
    );
  }

  const isSuperShell = location.pathname.startsWith("/dashboard/super");

  // Full-bleed Command Center: own chrome (Notalx-style), no double sidebars
  if (isSuperShell) {
    return (
      <NotificationsProvider>
        <ImpersonationBanner />
        <Outlet />
      </NotificationsProvider>
    );
  }

  return (
    <NotificationsProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="relative min-w-0 w-full max-w-[100dvw] bg-[#EEF2F6]">
          <ImpersonationBanner />
          <div
            className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
          >
            <DashboardTopBar />
          </div>
          <main className="min-w-0 w-full flex-1 overflow-x-hidden">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </NotificationsProvider>
  );
};

export default PrivateRoutes;
