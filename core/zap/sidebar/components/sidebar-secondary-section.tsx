"use client";

import { Bot, HelpCircle, Settings } from "lucide-react";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { useState } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SettingsSheet } from "../../ai/components";
import { FeedbackDialog } from "../../feedbacks/components";

type SidebarSecondarySectionProps = ComponentPropsWithoutRef<
  typeof SidebarGroup
>;

export function SidebarSecondarySection(props: SidebarSecondarySectionProps) {
  const [isFeedbackOpen, setFeedbackOpen] = useState(false);
  const [isAISettingsOpen, setAISettingsOpen] = useState(false);

  const menuItems = [
    {
      label: "AI Providers",
      icon: <Bot />,
      onClick: () => setAISettingsOpen(true),
    },
    {
      label: "Give Feedback",
      icon: <HelpCircle />,
      onClick: () => setFeedbackOpen(true),
    },
    {
      label: "Settings",
      icon: <Settings />,
      href: "/app/settings",
    },
  ];

  return (
    <>
      <SidebarGroup {...props}>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map(({ label, icon, onClick, href }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton asChild={!!href} onClick={onClick}>
                  {href ? (
                    <Link href={href}>
                      {icon}
                      <span>{label}</span>
                    </Link>
                  ) : (
                    <>
                      {icon}
                      <span>{label}</span>
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SettingsSheet onOpenChange={setAISettingsOpen} open={isAISettingsOpen} />
      <FeedbackDialog onOpenChange={setFeedbackOpen} open={isFeedbackOpen} />
    </>
  );
}
