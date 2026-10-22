import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Target,
  Settings,
  BookOpen,
  LogOut,
  ShieldCheck,
  BadgeCheck,
  TrendingUp,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  MessageSquare,
  Video,
  FolderLock,
  Wallet,
  Shield,
  Home,
  ListTodo,
  StickyNote,
  Gift,
  GraduationCap,
  Building2,
  Crosshair,
} from "lucide-react";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/lib/roles";
import {
  APPROVAL_QUEUE_ROLES,
  AUDIT_ROLES,
  BOOKING_ROLES,
  CONTENT_ROLES,
  CRM_ROLES,
  FUNNEL_ROLES,
  NETWORK_ROLES,
  RENTAL_STAFF_ROLES,
  USER_MANAGE_ROLES,
  SUPER_ADMIN_ROLES,
  ADMIN_ROLES,
} from "@/lib/roles";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { useNotifications } from "@/hooks/NotificationsProvider";
import { toast } from "sonner";
import { api } from "@/lib/api";
import LogoutModal from "@/components/global/LogoutModal";
import { cn } from "@/lib/utils";

export interface NavItem {
  title: string;
  url: string;
  icon?: any;
  isActive?: boolean;
  roles?: UserRole[];
  items?: { title: string; url: string; roles?: UserRole[] }[];
}

const PARTNER_MSG_ROLES: UserRole[] = [
  "landlord_partner",
  "referral_partner",
  "support_agent",
  "consultant",
  "mentor",
  "advisor_trainee",
  "client",
];
const VAULT_ROLES: UserRole[] = [
  "client",
  "advisor_trainee",
  "landlord_partner",
  "consultant",
  "rental_specialist",
];
const CLIENT_TOOL_ROLES: UserRole[] = ["client", "advisor_trainee"];
const REFERRAL_ROLES: UserRole[] = [
  "client",
  "referral_partner",
  "advisor_trainee",
];
const SETTINGS_ROLES: UserRole[] = [
  "client",
  "consultant",
  "support_agent",
  "content_editor",
  "ops_manager",
  "network_manager",
  "mentor",
  "advisor_trainee",
  "rental_specialist",
  "underwriter",
  "landlord_partner",
  "referral_partner",
  "admin",
  "super_admin",
];
const RENTAL_CLIENT_ROLES: UserRole[] = ["client"];
const SERVICE_NAV_ROLES: UserRole[] = ["admin", "super_admin", "ops_manager"];
const JOIN_NETWORK_ROLES: UserRole[] = [
  "client",
  "advisor_trainee",
  "network_manager",
];

const sidebardata = {
  teams: [{ name: "First Step Wealth Group", logo: BookOpen }],
  navMain: [
    {
      title: "Command Center",
      url: "/dashboard/super",
      icon: Crosshair,
      roles: SUPER_ADMIN_ROLES,
      items: [
        { title: "Pulse", url: "/dashboard/super" },
        { title: "War Room", url: "/dashboard/super/war-room" },
        { title: "People", url: "/dashboard/super/people" },
        { title: "Visitors map", url: "/dashboard/super/visitors" },
        { title: "Kill switches", url: "/dashboard/super/system" },
        { title: "Security", url: "/dashboard/super/security" },
      ],
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      roles: undefined, // all authenticated
      items: [
        { title: "Overview", url: "/dashboard" },
        { title: "Activity", url: "/dashboard/activity", roles: ADMIN_ROLES },
        { title: "Site visitors", url: "/admin/visitors", roles: ADMIN_ROLES },
      ],
    },
    {
      title: "Bookings",
      url: "/bookings",
      icon: Calendar,
      roles: BOOKING_ROLES,
      items: [
        { title: "Upcoming", url: "/bookings" },
        { title: "Completed", url: "/bookings/completed" },
        { title: "Cancelled", url: "/bookings/cancelled" },
      ],
    },
    {
      title: "Rental Support",
      url: "/rental-applications",
      icon: FileText,
      roles: RENTAL_CLIENT_ROLES,
      items: [
        { title: "My Applications", url: "/rental-applications" },
        { title: "New Application", url: "/rental-applications/new" },
      ],
    },
    {
      title: "Messages",
      url: "/app/messages",
      icon: MessageSquare,
      roles: PARTNER_MSG_ROLES,
      items: [{ title: "Inbox", url: "/app/messages" }],
    },
    {
      title: "Video Rooms",
      url: "/app/video",
      icon: Video,
      roles: ["client", "consultant", "mentor", "advisor_trainee", "support_agent"],
      items: [{ title: "Join call", url: "/app/video" }],
    },
    {
      title: "Document Vault",
      url: "/app/documents",
      icon: FolderLock,
      roles: VAULT_ROLES,
      items: [{ title: "My files", url: "/app/documents" }],
    },
    {
      title: "Wealth Studio",
      url: "/app/wealth-studio",
      icon: Wallet,
      roles: CLIENT_TOOL_ROLES,
      items: [{ title: "Projections", url: "/app/wealth-studio" }],
    },
    {
      title: "Insurance Planner",
      url: "/app/insurance-planner",
      icon: Shield,
      roles: CLIENT_TOOL_ROLES,
      items: [{ title: "Coverage plan", url: "/app/insurance-planner" }],
    },
    {
      title: "Housing Prefs",
      url: "/app/housing",
      icon: Home,
      roles: [...CLIENT_TOOL_ROLES, "landlord_partner"],
      items: [{ title: "Preferences", url: "/app/housing" }],
    },
    {
      title: "Task Center",
      url: "/app/tasks",
      icon: ListTodo,
      roles: [...CLIENT_TOOL_ROLES, "consultant", "support_agent"],
      items: [{ title: "My tasks", url: "/app/tasks" }],
    },
    {
      title: "Secure Notes",
      url: "/app/notes",
      icon: StickyNote,
      roles: [...CLIENT_TOOL_ROLES, "support_agent", "consultant"],
      items: [{ title: "Private notes", url: "/app/notes" }],
    },
    {
      title: "Referrals",
      url: "/app/referrals",
      icon: Gift,
      roles: REFERRAL_ROLES,
      items: [{ title: "Invite hub", url: "/app/referrals" }],
    },
    {
      title: "Join Network",
      url: "/join-network",
      icon: GraduationCap,
      roles: JOIN_NETWORK_ROLES,
      items: [{ title: "Apply / status", url: "/join-network" }],
    },
    {
      title: "Account",
      url: "/app/settings",
      icon: Settings,
      roles: SETTINGS_ROLES,
      items: [{ title: "Preferences", url: "/app/settings" }],
    },
    {
      title: "Leads",
      url: "/admin/leads",
      icon: Target,
      roles: CRM_ROLES,
      items: [
        { title: "All Leads", url: "/admin/leads" },
        { title: "New", url: "/admin/leads/new" },
        { title: "Converted", url: "/admin/leads/converted" },
      ],
    },
    {
      title: "Users",
      url: "/admin/clients",
      icon: Users,
      roles: USER_MANAGE_ROLES,
      items: [
        { title: "All users", url: "/admin/clients" },
        { title: "Active", url: "/admin/clients/active" },
        { title: "Inactive", url: "/admin/clients/inactive" },
      ],
    },
    {
      title: "Rental Queue",
      url: "/admin/rental-applications",
      icon: Building2,
      roles: RENTAL_STAFF_ROLES,
      items: [
        { title: "All applications", url: "/admin/rental-applications" },
      ],
    },
    {
      title: "Content",
      url: "/admin/content",
      icon: BookOpen,
      roles: CONTENT_ROLES,
      items: [
        { title: "All Content", url: "/admin/content" },
        { title: "Pages", url: "/admin/content/pages" },
        { title: "Blogs", url: "/admin/content/blogs" },
        { title: "Testimonials", url: "/admin/content/testimonials" },
      ],
    },
    {
      title: "Services",
      url: "/admin/services",
      icon: Settings,
      roles: SERVICE_NAV_ROLES,
      items: [
        { title: "All Services", url: "/admin/services" },
        { title: "Active", url: "/admin/services/active" },
        { title: "Inactive", url: "/admin/services/inactive" },
      ],
    },
    {
      title: "Approvals",
      url: "/admin/approvals",
      icon: BadgeCheck,
      roles: APPROVAL_QUEUE_ROLES,
      items: [{ title: "Queue", url: "/admin/approvals" }],
    },
    {
      title: "Audit Logs",
      url: "/admin/audit-logs",
      icon: ShieldCheck,
      roles: AUDIT_ROLES,
      items: [
        { title: "All Logs", url: "/admin/audit-logs" },
        { title: "Recent", url: "/admin/audit-logs/recent" },
      ],
    },
    {
      title: "Advisor Network",
      url: "/admin/advisor-applications",
      icon: TrendingUp,
      roles: NETWORK_ROLES,
      items: [
        { title: "Applications", url: "/admin/advisor-applications" },
        {
          title: "Analytics",
          url: "/admin/funnel",
          roles: FUNNEL_ROLES,
        },
      ],
    },
    {
      title: "Funnel",
      url: "/admin/funnel",
      icon: TrendingUp,
      roles: FUNNEL_ROLES.filter((r) => r !== "network_manager"),
      items: [
        { title: "Overview", url: "/admin/funnel" },
        { title: "Site visitors", url: "/admin/visitors", roles: ADMIN_ROLES },
      ],
    },
  ] as NavItem[],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const [openParentIndex, setOpenParentIndex] = useState<number | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { setOpenMobile, state, toggleSidebar, isMobile } = useSidebar();
  const { openNotificationsWithSoundUnlock } = useNotifications();
  const collapsed = state === "collapsed";

  const userData = {
    name: user?.name || "User",
    email: user?.email || "",
    avatar: "",
  };
  const userRole = user?.role as UserRole;

  const filteredNav = useMemo(() => {
    return sidebardata.navMain
      .filter((item) => !item.roles || item.roles.includes(userRole))
      .map((item) => ({
        ...item,
        isActive: pathname === item.url || pathname.startsWith(item.url + "/"),
        items: item.items
          ?.filter((sub) => !sub.roles || sub.roles.includes(userRole))
          .map((sub) => ({ ...sub })),
      }));
  }, [pathname, userRole]);

  const handleLogoutClick = () => {
    setOpenMobile(false);
    setLogoutModalOpen(true);
  };

  const performLogout = async () => {
    try {
      await api.post("/users/logout");
      setUser(null);
      navigate("/login");
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    } finally {
      setLogoutModalOpen(false);
    }
  };

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r border-[#12213E]/5 bg-[#E4EFF8]/95 shadow-lg backdrop-blur-xl"
        {...props}
      >
        <SidebarHeader className="border-b border-gray-100/50 pb-3 pt-5">
          <TeamSwitcher
            teams={sidebardata.teams}
            yearName="Empowering Your Future"
          />
          {!isMobile && (
            <SidebarMenu className="mt-2 px-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  onClick={toggleSidebar}
                  className={cn(
                    "w-full rounded-xl text-[#12213E] transition-all duration-300 hover:bg-white/70",
                    collapsed && "justify-center",
                  )}
                >
                  {collapsed ? (
                    <PanelLeftOpen className="h-5 w-5" />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" />
                  )}
                  <span>Collapse menu</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </SidebarHeader>
        <SidebarContent className="px-2 py-3">
          <NavMain
            items={filteredNav}
            openParentIndex={openParentIndex}
            setOpenParentIndex={setOpenParentIndex}
          />
        </SidebarContent>
        <SidebarFooter className="space-y-2 border-t border-gray-100/50 px-2 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Open notifications"
                className="rounded-xl text-[#475569] hover:bg-white/70 hover:text-[#12213E]"
                onClick={() => {
                  setOpenMobile(false);
                  openNotificationsWithSoundUnlock();
                }}
              >
                <Bell className="h-5 w-5" />
                <span>Alerts</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Logout"
                onClick={handleLogoutClick}
                className="group w-full rounded-xl text-sm font-medium text-[#12213E] transition-all hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <NavUser user={userData} />
        </SidebarFooter>
        <SidebarRail className="bg-transparent after:bg-[#C69259]/40 hover:after:bg-[#C69259]" />
      </Sidebar>

      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={performLogout}
      />
    </>
  );
}
