"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/use-current-user";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Base nav; Admin entries added dynamically by role
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ user, ...props }) {
  const sessionUser = useCurrentUser();
  const isAdmin = sessionUser?.role === "ADMIN" || user?.role === "ADMIN";
  // Admin navigation full sequence
  const adminNav = [
    { title: "Dashboard", url: "/dashboard/admin", icon: Settings2 },
    {
      title: "Assign User Test",
      url: "/dashboard/admin/assign",
      icon: Settings2,
    },
    { title: "Positions", url: "/dashboard/admin/positions", icon: Settings2 },
    {
      title: "Question Groups",
      url: "/dashboard/admin/groups",
      icon: Settings2,
    },
    { title: "Questions", url: "/dashboard/admin/questions", icon: Settings2 },
    { title: "Test Builder", url: "/dashboard/admin/quizzes", icon: Settings2 },
    {
      title: "User Management",
      url: "/dashboard/admin/users",
      icon: Settings2,
    },
    { title: "Grading", url: "/dashboard/admin/grading", icon: Settings2 },
    { title: "Analytics", url: "/dashboard/admin/analytics", icon: Settings2 },
  ];

  // Interviewee navigation
  const intervieweeNav = [
    { title: "My Tests", url: "/dashboard/my-tests", icon: Settings2 },
  ];

  const navItems = isAdmin
    ? [
        {
          title: "Admin",
          url: "/dashboard/admin",
          icon: Settings2,
          items: adminNav.map((n) => ({ title: n.title, url: n.url })),
        },
      ]
    : [
        {
          title: "Interviewee",
          url: "/dashboard",
          icon: Settings2,
          items: intervieweeNav.map((n) => ({ title: n.title, url: n.url })),
        },
      ];
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        {/* Portal switching button above Logout per product spec */}
        <div className="px-2 pb-2">
          {isAdmin ? (
            <Link href="/dashboard" passHref>
              <Button className="w-full" variant="secondary">
                Interviewee Portal
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/admin" passHref>
              <Button className="w-full" variant="secondary">
                Admin Portal
              </Button>
            </Link>
          )}
        </div>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
