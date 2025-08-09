import { ZapButton } from "@/components/zap-ui/button";

interface SaveSettingsProps {
  saving: boolean;
  isSaveDisabled: boolean;
}

export function SaveSettings({ saving, isSaveDisabled }: SaveSettingsProps) {
  return (
    <div className="flex justify-end">
      <ZapButton
        className="w-full sm:w-auto"
        disabled={isSaveDisabled}
        loading={saving}
        loadingText="Saving..."
        type="submit"
      >
        Save Settings
      </ZapButton>
    </div>
  );
}
