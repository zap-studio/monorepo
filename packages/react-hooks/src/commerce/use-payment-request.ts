import { useCallback, useState } from "react";

/** Status reported by `usePaymentRequest`. */
export type PaymentRequestStatus = "complete" | "error" | "idle" | "processing";

/** The shape returned by `usePaymentRequest`. */
export interface UsePaymentRequestResult {
  error: Error | undefined;
  pay: (
    methodData: PaymentMethodData[],
    details: PaymentDetailsInit,
    options?: PaymentOptions,
  ) => Promise<PaymentResponse | undefined>;
  status: PaymentRequestStatus;
  supported: boolean;
}

const isSupported = (): boolean => typeof PaymentRequest !== "undefined";

/**
 * Wraps the Payment Request API — shows the browser/OS's native payment
 * sheet for the given payment method data and details, resolving with the
 * user's `PaymentResponse` once they authorize it. Callers are
 * responsible for calling `response.complete("success" | "fail")` once
 * their own backend confirms the charge — this hook only tracks whether
 * the sheet itself completed or was cancelled/errored, not whether the
 * charge succeeded. `supported: false` — the SSR-safe default — where the
 * Payment Request API doesn't exist, and `pay()` then resolves
 * `undefined` without throwing.
 *
 * @example
 * ```tsx
 * const { pay, status } = usePaymentRequest();
 * const response = await pay(
 *   [{ supportedMethods: "basic-card" }],
 *   { total: { label: "Total", amount: { currency: "USD", value: "10.00" } } },
 * );
 * await response?.complete("success");
 * ```
 */
export const usePaymentRequest = (): UsePaymentRequestResult => {
  const supported = isSupported();
  const [status, setStatus] = useState<PaymentRequestStatus>("idle");
  const [error, setError] = useState<Error | undefined>(undefined);

  const pay = useCallback(
    async (
      methodData: PaymentMethodData[],
      details: PaymentDetailsInit,
      options?: PaymentOptions,
    ): Promise<PaymentResponse | undefined> => {
      if (!isSupported()) {
        setError(new Error("PaymentRequest is not supported by this browser."));
        setStatus("error");
        return undefined;
      }
      setStatus("processing");
      setError(undefined);
      try {
        const request = new PaymentRequest(methodData, details, options);
        const response = await request.show();
        setStatus("complete");
        return response;
      } catch (caught) {
        setError(caught instanceof Error ? caught : new Error(String(caught)));
        setStatus("error");
        return undefined;
      }
    },
    [],
  );

  return { error, pay, status, supported };
};
