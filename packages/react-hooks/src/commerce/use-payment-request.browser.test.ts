import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePaymentRequest } from "./use-payment-request.ts";

class MockPaymentResponse {
  complete = vi.fn(() => Promise.resolve());
  readonly methodName = "basic-card";
}

class MockPaymentRequest {
  static instances: MockPaymentRequest[] = [];
  static nextShow: (() => Promise<MockPaymentResponse>) | undefined;
  readonly methodData: PaymentMethodData[];
  readonly details: PaymentDetailsInit;

  constructor(methodData: PaymentMethodData[], details: PaymentDetailsInit) {
    this.methodData = methodData;
    this.details = details;
    MockPaymentRequest.instances.push(this);
  }

  show() {
    return MockPaymentRequest.nextShow?.() ?? Promise.resolve(new MockPaymentResponse());
  }
}

function installMockPaymentRequest() {
  MockPaymentRequest.instances = [];
  MockPaymentRequest.nextShow = undefined;
  Object.defineProperty(window, "PaymentRequest", {
    configurable: true,
    value: MockPaymentRequest,
  });
}

const methodData: PaymentMethodData[] = [{ supportedMethods: "basic-card" }];
const details: PaymentDetailsInit = {
  total: { amount: { currency: "USD", value: "10.00" }, label: "Total" },
};

afterEach(() => {
  Object.defineProperty(window, "PaymentRequest", { configurable: true, value: undefined });
});

describe(usePaymentRequest, () => {
  it('starts "idle" and reports supported: true when PaymentRequest exists', () => {
    installMockPaymentRequest();

    const { result } = renderHook(() => usePaymentRequest());

    expect(result.current.supported).toBe(true);
    expect(result.current.status).toBe("idle");
  });

  it("reports supported: false when PaymentRequest is unavailable", () => {
    const { result } = renderHook(() => usePaymentRequest());

    expect(result.current.supported).toBe(false);
  });

  it('pay() constructs a request, shows it, and becomes "complete"', async () => {
    installMockPaymentRequest();
    const { result } = renderHook(() => usePaymentRequest());

    let response: PaymentResponse | undefined;
    await act(async () => {
      response = await result.current.pay(methodData, details);
    });

    expect(MockPaymentRequest.instances[0]?.methodData).toBe(methodData);
    expect(MockPaymentRequest.instances[0]?.details).toBe(details);
    expect(response).toBeInstanceOf(MockPaymentResponse);
    expect(result.current.status).toBe("complete");
  });

  it("clears a previous error when starting a new payment", async () => {
    const { result } = renderHook(() => usePaymentRequest());

    await act(async () => {
      await result.current.pay(methodData, details);
    });
    expect(result.current.error).toBeDefined();

    installMockPaymentRequest();
    await act(async () => {
      await result.current.pay(methodData, details);
    });

    expect(result.current.error).toBeUndefined();
  });

  it('becomes "error" and resolves undefined when the user cancels the sheet', async () => {
    installMockPaymentRequest();
    MockPaymentRequest.nextShow = () => Promise.reject(new DOMException("cancelled", "AbortError"));
    const { result } = renderHook(() => usePaymentRequest());

    let response: PaymentResponse | undefined;
    await act(async () => {
      response = await result.current.pay(methodData, details);
    });

    expect(response).toBeUndefined();
    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("cancelled");
  });

  it("wraps a non-Error rejection", async () => {
    installMockPaymentRequest();
    MockPaymentRequest.nextShow = () => Promise.reject("cancelled");
    const { result } = renderHook(() => usePaymentRequest());

    await act(async () => {
      await result.current.pay(methodData, details);
    });

    expect(result.current.error?.message).toBe("cancelled");
  });

  it('pay() resolves undefined and becomes "error" when unsupported', async () => {
    const { result } = renderHook(() => usePaymentRequest());

    let response: PaymentResponse | undefined;
    await act(async () => {
      response = await result.current.pay(methodData, details);
    });

    expect(response).toBeUndefined();
    expect(result.current.status).toBe("error");
  });
});
