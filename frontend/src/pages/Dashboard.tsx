import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/AuthProvider";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import ConsultationBookingModal from "@/components/global/ConsultationBookingModal";
import WelcomeModal, {
  consumeNewAccountWelcome,
} from "@/components/global/WelcomeModal";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import RoleHubDashboard from "@/features/dashboard/role-hub/RoleHubDashboard";
import AdminDashboard from "@/features/dashboard/admin/AdminDashboard";
import { ROLE_HUB_ROLES, hasRole, isPlatformAdmin, type UserRole } from "@/lib/roles";
import { Navigate, useSearchParams } from "react-router";

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const forceAdminView = searchParams.get("view") === "admin";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [welcomeName, setWelcomeName] = useState<string | undefined>();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const requests: Promise<any>[] = [api.get("/dashboard/stats")];
    if (isPlatformAdmin(user.role) || user.role === "ops_manager") {
      requests.push(api.get("/audit-logs/recent?limit=12"));
    }
    Promise.all(requests)
      .then(([statsRes, auditRes]) => {
        setStats(statsRes.data);
        setRecentActivity(auditRes?.data?.logs || statsRes.data?.recentActivity || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || loading) return;
    const welcome = consumeNewAccountWelcome();
    if (welcome) {
      setWelcomeName(welcome.name || user.name);
      setWelcomeOpen(true);
    }
  }, [user, loading]);

  const welcomeModal = (
    <WelcomeModal
      isOpen={welcomeOpen}
      name={welcomeName || user?.name}
      onClose={() => setWelcomeOpen(false)}
    />
  );

  if (loading) {
    return (
      <div className="min-h-screen flex-1 bg-[#EEF2F6] py-5 sm:py-6 md:py-8">
        <div className="mx-auto w-[98%] space-y-5">
          <div className="rounded-2xl border border-[#E5EAF0] bg-white p-5 sm:p-7">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="mt-3 h-8 w-64 rounded-xl" />
            <Skeleton className="mt-2 h-4 w-80 max-w-full rounded-lg" />
            <Skeleton className="mt-6 h-12 w-full rounded-2xl" />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          </div>
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid gap-4 lg:grid-cols-12">
            <Skeleton className="h-56 rounded-2xl lg:col-span-5" />
            <Skeleton className="h-56 rounded-2xl lg:col-span-7" />
          </div>
        </div>
      </div>
    );
  }

  const role = user?.role as UserRole | undefined;

  // Each role gets its own dashboard surface: never mix admin shell into staff hubs.
  if (role === "client") {
    return (
      <>
        <ClientDashboard
          user={{ ...user, assignedConsultant: stats.assignedConsultant }}
          stats={stats}
          onBook={() => setBookingModalOpen(true)}
        />
        <ConsultationBookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
        />
        {welcomeModal}
      </>
    );
  }

  // Super lands on Command Center by default; ?view=admin opens classic admin hub.
  if (role === "super_admin" && !forceAdminView) {
    return <Navigate to="/dashboard/super" replace />;
  }

  if (role === "admin" || role === "super_admin") {
    return (
      <>
        <AdminDashboard stats={stats} recentActivity={recentActivity} />
        {welcomeModal}
      </>
    );
  }

  if (role && hasRole(role, ROLE_HUB_ROLES)) {
    return (
      <>
        <RoleHubDashboard user={user} stats={stats} role={role} />
        {welcomeModal}
      </>
    );
  }

  return (
    <>
      <div className="flex min-h-[40vh] items-center justify-center p-8 text-center text-sm text-[#6B7280]">
        No dashboard is configured for role “{role || "unknown"}”.
      </div>
      {welcomeModal}
    </>
  );
}
