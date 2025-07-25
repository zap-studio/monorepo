import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { AISettingsSheetForm } from "./ai-settings-sheet-form";

interface AISettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISettingsSheet({ open, onOpenChange }: AISettingsSheetProps) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="space-y-2">
          <SheetTitle>AI Settings</SheetTitle>
          <SheetDescription>
            Configure your AI provider and API key securely.
          </SheetDescription>
        </SheetHeader>

        <AISettingsSheetForm onOpenChange={onOpenChange} open={open} />
      </SheetContent>
    </Sheet>
  );
}
