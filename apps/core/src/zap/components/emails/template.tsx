import * as React from "react";
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
import { BASE_URL } from "@/zap.config";

export function TemplateEmail() {
  return (
    <Html>
      <Head />
      <Preview>A simple email from us</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Hey there 👋</Text>
          <Text style={paragraph}>
            Just a quick note with a button you can click. No strings attached.
          </Text>
          <Section style={buttonWrapper}>
            <Button href={BASE_URL} style={button}>
              Click me
            </Button>
          </Section>
          <Text style={footer}>
            If the button doesn’t work, you can paste this link into your
            browser:
            <br />
            {BASE_URL}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f9fafb",
  padding: "40px 0",
  fontFamily: "Arial, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "8px",
  maxWidth: "520px",
  margin: "0 auto",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const heading = {
  fontSize: "22px",
  fontWeight: "bold" as const,
  marginBottom: "16px",
  color: "#111827",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#374151",
  marginBottom: "24px",
};

const buttonWrapper = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#000000",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  fontWeight: "bold" as const,
  textDecoration: "none",
  display: "inline-block",
};

const footer = {
  fontSize: "14px",
  color: "#6B7280",
  lineHeight: "1.5",
  wordBreak: "break-word" as const,
};
