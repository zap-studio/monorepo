import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Button,
  Section,
} from "@react-email/components";
import * as React from "react";

interface EmailProps {
  url: string;
}

export function ForgotPasswordEmail({ url }: EmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Reset your password</Text>
          <Text style={paragraph}>
            We received a request to reset your password. Click the button below
            to set a new one. If you didn&apos;t make this request, you can
            safely ignore this email.
          </Text>
          <Section style={buttonWrapper}>
            <Button href={url} style={button}>
              Reset Password
            </Button>
          </Section>
          <Text style={footer}>
            If the button doesn&apos;t work, copy and paste this URL into your
            browser:
            <br />
            {url}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f9f9f9",
  padding: "40px 0",
  fontFamily: "Helvetica, Arial, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "40px",
  maxWidth: "500px",
  margin: "0 auto",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  marginBottom: "20px",
  color: "#000",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.5",
  marginBottom: "30px",
  color: "#333",
};

const buttonWrapper = {
  textAlign: "center" as const,
  marginBottom: "30px",
};

const button = {
  backgroundColor: "#000",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "4px",
  textDecoration: "none",
  fontWeight: "bold" as const,
  display: "inline-block",
};

const footer = {
  fontSize: "14px",
  color: "#888",
  lineHeight: "1.5",
};
