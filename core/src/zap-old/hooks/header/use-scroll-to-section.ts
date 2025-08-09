"use client";

import { useRouter } from "@bprogress/next/app";
import { usePathname } from "next/navigation";

import { HEADER_HEIGHT } from "@/zap-old/components/common/header";

export function useScrollToSection(offset = HEADER_HEIGHT) {
  const pathname = usePathname();
  const router = useRouter();

  const scrollToSection = (sectionId: string) => {
    if (pathname !== "/") {
      router.push("/");
      return;
    }

    const section = document.getElementById(sectionId);
    if (section) {
      const position = section.offsetTop - offset;
      window.scrollTo({ top: position, behavior: "smooth" });
    }
  };

  return scrollToSection;
}
