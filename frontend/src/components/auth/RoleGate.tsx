import { Navigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { hasRole, type UserRole } from "@/lib/roles";

type Props = {
  roles: readonly UserRole[];
  children: React.ReactNode;
  fallback?: string;
};

/** Blocks deep-links to pages the user's role may not open. */
export default function RoleGate({
  roles,
  children,
  fallback = "/dashboard",
}: Props) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!hasRole(user?.role, roles)) {
    return <Navigate to={fallback} replace />;
  }
  return <>{children}</>;
}
