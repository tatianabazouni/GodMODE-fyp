import { LayoutDashboard, Clock, BookOpen, Palette, Target, Users, BarChart3, User, Sparkles } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { getLevelInfo } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Memory Capsule", url: "/life-capsule", icon: Clock },
  { title: "Journal", url: "/journal", icon: BookOpen },
  { title: "Vision Board", url: "/vision-board", icon: Palette },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Connections", url: "/connections", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const userName = "Explorer";
  const userAvatar = "";
  const userXp = 0;
  const levelInfo = getLevelInfo(userXp);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary shrink-0" />
          {!collapsed && <span className="font-display text-lg font-bold">LifeOS</span>}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-9 w-9 border border-sidebar-border">
              {userAvatar && <AvatarImage src={userAvatar} />}
              <AvatarFallback className="bg-primary/10">{userName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground">{levelInfo.current.title}</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{userXp} XP</span>
              <span>Lvl {levelInfo.current.level}</span>
            </div>
            <Progress value={levelInfo.progress} className="h-1.5" />
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
