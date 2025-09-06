import { getPriceDisplay } from "../utils";
import type { RecurringInterval } from "../zap.plugin.config.types";

type PriceDisplayProps = {
  price: number | string;
  interval: RecurringInterval;
  alignment?: "center" | "left";
};

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
        <span className="font-extrabold text-4xl tracking-tight">
          {displayPrice}
        </span>
        {intervalText && (
          <span className="mb-1 font-medium text-muted-foreground text-sm">
            {intervalText}
          </span>
        )}
      </div>
    </div>
  );
}
