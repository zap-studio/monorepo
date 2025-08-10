import { RecurringInterval } from "@/zap.config.types";
import { getPriceDisplay } from "../utils";

interface PriceDisplayProps {
  price: number | string;
  interval: RecurringInterval;
  alignment?: "center" | "left";
}

export function PriceDisplay({
  price,
  interval,
  alignment = "center",
}: PriceDisplayProps) {
  const { displayPrice, intervalText } = getPriceDisplay(price, interval);

  const alignmentClasses =
    alignment === "center"
      ? "items-center text-center"
      : "items-start text-left";

  return (
    <div
      className={`mt-2 flex flex-col space-y-1 transition-all duration-500 ${alignmentClasses}`}
    >
      <div className="flex items-end space-x-2">
        <span className="text-4xl font-extrabold tracking-tight">
          {displayPrice}
        </span>
        {intervalText && (
          <span className="text-muted-foreground mb-1 text-sm font-medium">
            {intervalText}
          </span>
        )}
      </div>
    </div>
  );
}
