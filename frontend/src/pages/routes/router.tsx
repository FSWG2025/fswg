import { createBrowserRouter, Navigate } from "react-router";
import RootTrackingLayout from "@/pages/layouts/RootTrackingLayout";
import PublicLayout from "@/pages/layouts/PublicLayout";
import Home from "@/pages/Home";
import RentalGuarantee from "@/pages/RentalGuarantee";
import Insurance from "@/pages/Insurance";
import RealEstate from "@/pages/RealEstate";
import Wealth from "@/pages/Wealth";
import About from "@/pages/About";
import Testimonials from "@/pages/Testimonials";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import RouteError from "@/pages/RouteError";
import PrivateRoutes from "./PrivateRoutes";
import RoleGate from "@/components/auth/RoleGate";
import Dashboard from "@/pages/Dashboard";
import DashboardActivity from "@/pages/admin/DashboardActivity";
import Consultations from "@/pages/Consultations";
import RentalApplications from "@/pages/RentalApplications";
import NewRentalApplication from "@/pages/NewRentalApplication";
import JoinNetwork from "@/pages/JoinNetwork";
import LeadManagementAll from "@/pages/admin/LeadManagementAll";
import LeadManagementNew from "@/pages/admin/LeadManagementNew";
import LeadManagementConverted from "@/pages/admin/LeadManagementConverted";
import ClientManagementAll from "@/pages/admin/ClientManagementAll";
import ClientManagementActive from "@/pages/admin/ClientManagementActive";
import ClientManagementInactive from "@/pages/admin/ClientManagementInactive";
import ContentManagementAll from "@/pages/admin/ContentManagementAll";
import ContentManagementPages from "@/pages/admin/ContentManagementPages";
import ContentManagementBlogs from "@/pages/admin/ContentManagementBlogs";
import ContentManagementTestimonials from "@/pages/admin/ContentManagementTestimonials";
import ServiceManagementAll from "@/pages/admin/ServiceManagementAll";
import ServiceManagementActive from "@/pages/admin/ServiceManagementActive";
import ServiceManagementInactive from "@/pages/admin/ServiceManagementInactive";
import AuditLogsAll from "@/pages/admin/AuditLogsAll";
import AuditLogsRecent from "@/pages/admin/AuditLogsRecent";
import AdvisorApplications from "@/pages/admin/AdvisorApplications";
import FunnelAnalytics from "@/pages/admin/FunnelAnalytics";
import SiteVisitors from "@/pages/admin/SiteVisitors";
import RentalApplicationManagement from "@/pages/admin/RentalApplicationManagement";
import ServiceList from "@/pages/ServiceList";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Messages from "@/pages/client/Messages";
import VideoRooms from "@/pages/client/VideoRooms";
import DocumentVault from "@/pages/client/DocumentVault";
import WealthStudio from "@/pages/client/WealthStudio";
import InsurancePlanner from "@/pages/client/InsurancePlanner";
import HousingPreferences from "@/pages/client/HousingPreferences";
import TaskCenter from "@/pages/client/TaskCenter";
import SecureNotes from "@/pages/client/SecureNotes";
import Referrals from "@/pages/client/Referrals";
import AccountSettings from "@/pages/client/AccountSettings";
import ApprovalsQueue from "@/pages/admin/ApprovalsQueue";
import SuperLayout from "@/features/super-admin/SuperLayout";
import PulsePage from "@/pages/super/PulsePage";
import OmnisciencePage from "@/pages/super/OmnisciencePage";
import PeoplePage from "@/pages/super/PeoplePage";
import VisitorsMapPage from "@/pages/super/VisitorsMapPage";
import SystemPage from "@/pages/super/SystemPage";
import SecurityPage from "@/pages/super/SecurityPage";
import WarRoomPage from "@/pages/super/WarRoomPage";
import ContentAdsPage from "@/pages/super/ContentAdsPage";
import ExportsPage from "@/pages/super/ExportsPage";
import ForensicsPage from "@/pages/super/ForensicsPage";
import BotBlocked from "@/pages/BotBlocked";
import {
  APPROVAL_QUEUE_ROLES,
  AUDIT_ROLES,
  BOOKING_ROLES,
  CONTENT_ROLES,
  CRM_ROLES,
  FUNNEL_ROLES,
  NETWORK_ROLES,
  RENTAL_STAFF_ROLES,
  SUPER_ADMIN_ROLES,
  USER_MANAGE_ROLES,
  ADMIN_ROLES,
} from "@/lib/roles";

const gate = (roles: readonly import("@/lib/roles").UserRole[], el: React.ReactNode) => (
  <RoleGate roles={roles}>{el}</RoleGate>
);

export const router = createBrowserRouter([
  {
    element: <RootTrackingLayout />,
    errorElement: <RouteError />,
    children: [
      {
        element: <PublicLayout />,
        errorElement: <RouteError />,
        children: [
          { index: true, element: <Home /> },
          { path: "rental-guarantee", element: <RentalGuarantee /> },
          { path: "insurance", element: <Insurance /> },
          { path: "real-estate", element: <RealEstate /> },
          { path: "wealth", element: <Wealth /> },
          { path: "about", element: <About /> },
          { path: "testimonials", element: <Testimonials /> },
          { path: "services", element: <ServiceList /> },
          { path: "blog", element: <Blog /> },
          { path: "blog/:slug", element: <BlogPost /> },
        ],
      },
      { path: "blocked", element: <BotBlocked />, errorElement: <RouteError /> },
      { path: "login", element: <Login />, errorElement: <RouteError /> },
      { path: "register", element: <Register />, errorElement: <RouteError /> },
      { path: "forgot-password", element: <ForgotPassword />, errorElement: <RouteError /> },
      { path: "reset-password/:token", element: <ResetPassword />, errorElement: <RouteError /> },
      {
        element: <PrivateRoutes />,
        errorElement: <RouteError />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          {
            path: "dashboard/super",
            element: gate(SUPER_ADMIN_ROLES, <SuperLayout />),
            children: [
              { index: true, element: <PulsePage /> },
              { path: "omniscience", element: <OmnisciencePage /> },
              { path: "people", element: <PeoplePage /> },
              { path: "visitors", element: <VisitorsMapPage /> },
              { path: "system", element: <SystemPage /> },
              { path: "security", element: <SecurityPage /> },
              { path: "war-room", element: <WarRoomPage /> },
              { path: "content", element: <ContentAdsPage /> },
              { path: "exports", element: <ExportsPage /> },
              { path: "forensics/:type/:id", element: <ForensicsPage /> },
            ],
          },
          {
            path: "dashboard/activity",
            element: gate(ADMIN_ROLES, <DashboardActivity />),
          },
          {
            path: "bookings",
            element: gate(BOOKING_ROLES, <Consultations defaultFilter="scheduled" />),
          },
          {
            path: "bookings/completed",
            element: gate(BOOKING_ROLES, <Consultations defaultFilter="completed" />),
          },
          {
            path: "bookings/cancelled",
            element: gate(BOOKING_ROLES, <Consultations defaultFilter="cancelled" />),
          },
          {
            path: "rental-applications",
            element: gate(["client"], <RentalApplications />),
          },
          {
            path: "rental-applications/new",
            element: gate(["client"], <NewRentalApplication />),
          },
          { path: "app/messages", element: <Messages /> },
          { path: "app/video", element: <VideoRooms /> },
          { path: "app/documents", element: <DocumentVault /> },
          { path: "app/wealth-studio", element: <WealthStudio /> },
          { path: "app/insurance-planner", element: <InsurancePlanner /> },
          { path: "app/housing", element: <HousingPreferences /> },
          { path: "app/tasks", element: <TaskCenter /> },
          { path: "app/notes", element: <SecureNotes /> },
          { path: "app/referrals", element: <Referrals /> },
          { path: "app/settings", element: <AccountSettings /> },
          { path: "join-network", element: <JoinNetwork /> },
          { path: "admin/leads", element: gate(CRM_ROLES, <LeadManagementAll />) },
          { path: "admin/leads/new", element: gate(CRM_ROLES, <LeadManagementNew />) },
          {
            path: "admin/leads/converted",
            element: gate(CRM_ROLES, <LeadManagementConverted />),
          },
          {
            path: "admin/clients",
            element: gate(USER_MANAGE_ROLES, <ClientManagementAll />),
          },
          {
            path: "admin/clients/active",
            element: gate(USER_MANAGE_ROLES, <ClientManagementActive />),
          },
          {
            path: "admin/clients/inactive",
            element: gate(USER_MANAGE_ROLES, <ClientManagementInactive />),
          },
          {
            path: "admin/content",
            element: gate(CONTENT_ROLES, <ContentManagementAll />),
          },
          {
            path: "admin/content/pages",
            element: gate(CONTENT_ROLES, <ContentManagementPages />),
          },
          {
            path: "admin/content/blogs",
            element: gate(CONTENT_ROLES, <ContentManagementBlogs />),
          },
          {
            path: "admin/content/testimonials",
            element: gate(CONTENT_ROLES, <ContentManagementTestimonials />),
          },
          {
            path: "admin/services",
            element: gate(["admin", "super_admin", "ops_manager"], <ServiceManagementAll />),
          },
          {
            path: "admin/services/active",
            element: gate(["admin", "super_admin", "ops_manager"], <ServiceManagementActive />),
          },
          {
            path: "admin/services/inactive",
            element: gate(["admin", "super_admin", "ops_manager"], <ServiceManagementInactive />),
          },
          {
            path: "admin/approvals",
            element: gate(APPROVAL_QUEUE_ROLES, <ApprovalsQueue />),
          },
          {
            path: "admin/audit-logs",
            element: gate(AUDIT_ROLES, <AuditLogsAll />),
          },
          {
            path: "admin/audit-logs/recent",
            element: gate(AUDIT_ROLES, <AuditLogsRecent />),
          },
          {
            path: "admin/advisor-applications",
            element: gate(NETWORK_ROLES, <AdvisorApplications />),
          },
          {
            path: "admin/funnel",
            element: gate(FUNNEL_ROLES, <FunnelAnalytics />),
          },
          {
            path: "admin/visitors",
            element: gate(ADMIN_ROLES, <SiteVisitors />),
          },
          {
            path: "admin/rental-applications",
            element: gate(RENTAL_STAFF_ROLES, <RentalApplicationManagement />),
          },
          { path: "admin", element: <Navigate to="/dashboard" replace /> },
        ],
      },
      { path: "*", element: <RouteError /> },
    ],
  },
]);
