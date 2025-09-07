"use client";

import { Bot, HelpCircle, Settings } from "lucide-react";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { useMemo, useState } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { isPluginEnabled } from "@/lib/plugins";
import { SettingsSheet } from "@/zap/ai/components/settings-sheet";
import { FeedbackDialog } from "@/zap/feedbacks/components/feedback-dialog";

type SidebarSecondarySectionProps = ComponentPropsWithoutRef<
  typeof SidebarGroup
>;

export function SidebarSecondarySection(props: SidebarSecondarySectionProps) {
  const [isFeedbackOpen, setFeedbackOpen] = useState(false);
  const [isAISettingsOpen, setAISettingsOpen] = useState(false);

  const isAIEnabled = useMemo(() => isPluginEnabled("ai"), []);
  const isFeedbackEnabled = useMemo(() => isPluginEnabled("feedbacks"), []);

  const menuItems = useMemo(
    () => [
      {
        label: "AI Providers",
        icon: <Bot />,
        onClick: () => setAISettingsOpen(true),
        disabled: !isAIEnabled,
      },
      {
        label: "Give Feedback",
        icon: <HelpCircle />,
        onClick: () => setFeedbackOpen(true),
        disabled: !isFeedbackEnabled,
      },
      {
        label: "Settings",
        icon: <Settings />,
        href: "/app/settings",
      },
    ],
    [isAIEnabled, isFeedbackEnabled]
  );

  return (
    <>
      <SidebarGroup {...props}>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map(({ label, icon, onClick, href, disabled }) => {
              if (disabled) {
                return null;
              }

              return (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton asChild={!!href} onClick={onClick}>
                    {href ? (
                      <Link href={{ pathname: href }}>
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
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SettingsSheet onOpenChange={setAISettingsOpen} open={isAISettingsOpen} />
      <FeedbackDialog onOpenChange={setFeedbackOpen} open={isFeedbackOpen} />
    </>
  );
}
