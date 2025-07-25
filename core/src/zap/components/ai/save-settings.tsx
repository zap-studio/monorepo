import { ZapButton } from "@/components/zap-ui/button";

interface SaveSettingsProps {
  isSaving: boolean;
  isSaveDisabled: boolean;
}

export function SaveSettings({ isSaving, isSaveDisabled }: SaveSettingsProps) {
  return (
    <div className="flex justify-end">
      <ZapButton
        className="w-full sm:w-auto"
        disabled={isSaveDisabled}
        loading={isSaving}
        loadingText="Saving..."
        type="submit"
      >
        Save Settings
      </ZapButton>
    </div>
  );
}
