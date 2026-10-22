import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

export function NavUser({
  user,
}: {
  user: { name: string; email: string; avatar: string };
}) {
  useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-[#12213E]/5 transition-all" title="Profile">
        <Avatar className="h-10 w-10 rounded-xl shadow-md border-2 border-[#C69259]/30">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="rounded-xl bg-gradient-to-br from-[#12213E] to-[#1E3A5F] text-[#C69259] font-bold">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-bold text-[#12213E]">{user.name}</span>
          <span className="truncate text-xs text-gray-500">{user.email}</span>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}