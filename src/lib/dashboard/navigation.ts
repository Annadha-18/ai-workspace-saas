import {
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "AI Chat", href: "/dashboard/chat", icon: MessageSquare },
  { title: "Documents", href: "/dashboard/documents", icon: FileText },
  { title: "Settings", href: "/dashboard/settings", icon: Settings, disabled: true },
];
