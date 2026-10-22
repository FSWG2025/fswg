import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import NotificationBell from "@/components/dashboard/NotificationBell";
import { cn } from "@/lib/utils";

/** Reserved width for the notification bell (button + badge breathing room) */
const BELL_SLOT = "2.75rem"; // 44px

export default function DashboardTopBar() {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <header
      className="relative flex h-14 w-full shrink-0 items-center border-b border-[#12213E]/8 bg-transparent"
      style={{
        paddingLeft: "max(0.75rem, env(safe-area-inset-left, 0px))",
        /* Leave a permanent slot for the bell on every phone width */
        paddingRight: `max(0.75rem, calc(${BELL_SLOT} + 0.75rem + env(safe-area-inset-right, 0px)))`,
      }}
    >
      {/* Left cluster: truncates inside remaining space */}
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden pr-2">
        {isMobile ? (
          <SidebarTrigger className="h-10 w-10 shrink-0 rounded-xl text-[#12213E] hover:bg-[#E4EFF8]">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        ) : (
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl bg-[#F4F6F8] px-3 text-sm font-semibold text-[#12213E] ring-1 ring-[#12213E]/8 transition hover:bg-[#E4EFF8] hover:ring-[#C69259]/35"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {collapsed ? "Expand" : "Collapse"}
            </span>
          </button>
        )}
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <img
            src="/fswgLogo.jpg"
            alt="FSWG"
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
          <span className="truncate text-sm font-bold text-[#12213E] max-[340px]:hidden">
            FSWG
          </span>
        </div>
        <p className="hidden min-w-0 truncate text-xs text-[#6B7280] md:block">
          Tip: press{" "}
          <kbd className="rounded bg-[#F4F6F8] px-1.5 py-0.5 font-semibold text-[#12213E]">
            B
          </kbd>{" "}
          with Ctrl/⌘ to toggle the sidebar
        </p>
      </div>

      {/* Bell: absolutely reserved on the right for all mobile viewports */}
      <div
        className="pointer-events-auto absolute top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center"
        style={{
          right: "max(0.75rem, env(safe-area-inset-right, 0px))",
        }}
        data-slot="notification-bell"
      >
        <NotificationBell />
      </div>
    </header>
  );
}
