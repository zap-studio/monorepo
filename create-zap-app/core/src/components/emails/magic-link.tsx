import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Text,
} from "@react-email/components";

interface MagicLinkEmailProps {
  url: string;
}

export function MagicLinkEmail({ url }: MagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
          <Heading style={{ fontSize: "24px", marginBottom: "20px" }}>
            Your Magic Link to Zap.ts
          </Heading>
          <Text style={{ fontSize: "16px", marginBottom: "20px" }}>
            Click the button below to sign in to Zap.ts. This link will expire
            in 15 minutes.
          </Text>
          <Button
            href={url}
            style={{
              backgroundColor: "#3B82F6",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Sign In Now
          </Button>
          <Text style={{ fontSize: "14px", color: "#666", marginTop: "20px" }}>
            If you didn&apos;t request this link, you can safely ignore this
            email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
