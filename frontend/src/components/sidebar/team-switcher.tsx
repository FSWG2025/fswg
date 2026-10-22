import { ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useState } from "react";

export function TeamSwitcher({
  teams,
  yearName,
}: {
  teams: { name: string; logo: React.ElementType }[];
  yearName: string;
}) {
  const { isMobile } = useSidebar();
  const [activeTeam] = useState(teams[0]);

  if (!activeTeam) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-[#12213E]/5 data-[state=open]:text-[#12213E] px-3 py-4 rounded-2xl transition-all hover:bg-[#12213E]/5"
            >
              <div className="bg-white rounded-full overflow-hidden flex aspect-square size-10 items-center justify-center border-2 border-[#C69259]/30 shadow-md">
                <img
                  src="/fswgLogo.jpg"
                  alt="FSWG"
                  className="h-8 w-8 rounded-full object-cover"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-[#12213E]">{activeTeam.name}</span>
                <span className="truncate text-xs text-gray-500">{yearName}</span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 text-gray-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl shadow-lg border border-gray-100"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase">
              Platform
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem key={team.name} className="gap-3 p-3 rounded-lg cursor-pointer">
                <div className="flex size-8 items-center justify-center rounded-lg bg-white border border-[#C69259]/30 overflow-hidden">
                  <img
                    src="/fswgLogo.jpg"
                    alt={team.name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}