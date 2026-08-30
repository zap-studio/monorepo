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
 * Wraps the browser's Payment Request API. It shows the native payment
 * sheet for the given payment method and details, and resolves with the
 * user's `PaymentResponse` once they approve it.
 *
 * You must call `response.complete("success" | "fail")` yourself once
 * your backend confirms the charge. This hook only tracks whether the
 * payment sheet closed or errored, not whether the charge actually
 * succeeded.
 *
 * `supported` is `false` by default (safe for server-side rendering) and
 * stays `false` where the Payment Request API doesn't exist. In that
 * case, `pay()` resolves `undefined` instead of throwing.
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
