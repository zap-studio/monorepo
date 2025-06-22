import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PricingToggleProps {
  onToggle: (isYearly: boolean) => void;
  isYearly: boolean;
  yearlyDiscount: number;
}

export function PricingToggle({
  onToggle,
  isYearly,
  yearlyDiscount = 0.2,
}: PricingToggleProps) {
  const handleToggle = (checked: boolean) => {
    onToggle(checked);
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <Label
        htmlFor="pricing-toggle"
        className={!isYearly ? "font-medium" : "text-muted-foreground"}
      >
        Monthly
      </Label>
      <Switch
        id="pricing-toggle"
        checked={isYearly}
        onCheckedChange={handleToggle}
      />
      <div className="flex items-center space-x-1">
        <Label
          htmlFor="pricing-toggle"
          className={isYearly ? "font-medium" : "text-muted-foreground"}
        >
          Yearly
        </Label>

        <span className="animate-pulse rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
          Save {(yearlyDiscount * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
