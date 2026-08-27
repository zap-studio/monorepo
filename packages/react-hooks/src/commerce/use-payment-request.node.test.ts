import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { usePaymentRequest } from "./use-payment-request.ts";

const TestComponent = () => {
  const { supported } = usePaymentRequest();
  return supported ? "true" : "false";
};

describe(usePaymentRequest, () => {
  it("renders false on the server, before PaymentRequest can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
