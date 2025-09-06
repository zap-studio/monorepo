import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type PricingToggleProps = {
  onToggle: (isYearly: boolean) => void;
  isYearly: boolean;
  yearlyDiscount: number;
};

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
        className={isYearly ? "text-muted-foreground" : "font-medium"}
        htmlFor="pricing-toggle"
      >
        Monthly
      </Label>

      <Switch
        checked={isYearly}
        id="pricing-toggle"
        onCheckedChange={handleToggle}
      />

      <div className="flex items-center space-x-1">
        <Label
          className={isYearly ? "font-medium" : "text-muted-foreground"}
          htmlFor="pricing-toggle"
        >
          Yearly
        </Label>

        <span className="animate-pulse rounded-md bg-green-100 px-2 py-0.5 font-semibold text-green-700 text-xs">
          Save {yearlyDiscount.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
