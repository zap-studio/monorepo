import { Button, Html } from "@react-email/components";
import * as React from "react";

interface EmailProps {
  url: string;
}

export function VerificationEmail({ url }: EmailProps) {
  return (
    <Html>
      <Button
        href={url}
        style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
      >
        Verify Email
      </Button>
    </Html>
  );
}
