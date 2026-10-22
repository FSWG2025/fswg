import { ChevronRight, type LucideIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
  openParentIndex,
  setOpenParentIndex,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: { title: string; url: string }[];
  }[];
  openParentIndex: number | null;
  setOpenParentIndex: (idx: number | null) => void;
}) {
  const { isMobile, setOpenMobile, state } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  const handleParentClick = (idx: number) => {
    setOpenParentIndex(openParentIndex === idx ? null : idx);
  };

  const handleChildClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  const btnClass = (isActive?: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300",
      isActive
        ? "bg-gradient-to-r from-[#12213E] to-[#1E3A5F] text-white shadow-md shadow-[#12213E]/20"
        : "text-[#475569] hover:bg-[#12213E]/5 hover:text-[#12213E]"
    );

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {items.map((item, idx) =>
          collapsed ? (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={btnClass(item.isActive)}
              >
                <Link to={item.url} onClick={handleChildClick}>
                  {item.icon && (
                    <item.icon
                      className={cn("h-5 w-5", item.isActive && "text-[#C69259]")}
                    />
                  )}
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <Collapsible
              key={item.title}
              open={openParentIndex === idx}
              onOpenChange={() => handleParentClick(idx)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() => handleParentClick(idx)}
                    className={btnClass(item.isActive)}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn("h-5 w-5", item.isActive && "text-[#C69259]")}
                      />
                    )}
                    <span className="flex-1 font-medium">{item.title}</span>
                    {item.items && (
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <SidebarMenuSub className="ml-6 mt-1 space-y-0.5 border-l-2 border-[#12213E]/10 pl-4">
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm font-medium transition-all",
                            "text-[#475569] hover:bg-[#12213E]/5 hover:text-[#12213E]",
                            "data-[active=true]:bg-[#C69259]/10 data-[active=true]:text-[#C69259]"
                          )}
                        >
                          <Link to={subItem.url} onClick={handleChildClick}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
