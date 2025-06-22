import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SaveSettingsProps {
  isSaving: boolean;
  isSaveDisabled: boolean;
}

export function SaveSettings({ isSaving, isSaveDisabled }: SaveSettingsProps) {
  return (
    <div className="flex justify-end">
      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={isSaving || isSaveDisabled}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </div>
  );
}
