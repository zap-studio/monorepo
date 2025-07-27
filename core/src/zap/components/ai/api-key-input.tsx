import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ZapButton } from "@/components/zap-ui/button";
import type { FormFieldProps } from "@/zap/components/ai/provider-select";

export function ApiKeyInput({
  control,
  disabled,
  loading,
  testing,
  handleTestApiKey,
}: FormFieldProps & {
  loading: boolean;
  testing: boolean;
  handleTestApiKey: () => void;
}) {
  const [showKey, setShowKey] = useState(false);

  return (
    <FormField
      control={control}
      name="apiKey"
      render={({ field }) => (
        <div className="flex items-end space-x-2">
          <FormItem className="flex-1">
            <FormLabel>API Key</FormLabel>
            <FormControl className="relative flex-1">
              <div className="relative">
                <Input
                  placeholder={loading ? "Loading..." : "Enter your API key"}
                  type={showKey ? "text" : "password"}
                  {...field}
                  className="pr-10 font-mono"
                  disabled={disabled}
                />
                <button
                  className="text-muted-foreground hover:text-foreground active:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                  onClick={() => setShowKey((prev) => !prev)}
                  tabIndex={-1}
                  type="button"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
          <ZapButton
            disabled={disabled || !field.value}
            loading={testing}
            loadingText="Testing..."
            onClick={handleTestApiKey}
            type="button"
            variant="outline"
          >
            Test API Key
          </ZapButton>
        </div>
      )}
    />
  );
}
