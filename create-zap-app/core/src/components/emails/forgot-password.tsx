import { Button, Html } from "@react-email/components";
import * as React from "react";

interface EmailProps {
  url: string;
}

export function ForgotPasswordEmail({ url }: EmailProps) {
  return (
    <Html>
      <Button
        href={url}
        style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
      >
        Reset Password
      </Button>
    </Html>
  );
}
