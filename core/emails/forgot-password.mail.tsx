import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type MailProps = {
  url: string;
};

export default function ForgotPasswordMail({ url }: MailProps) {
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
          </Text>

          <Text style={urlText}>{url}</Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f9fafb",
  padding: "40px 0",
  fontFamily: "Helvetica, Arial, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "40px",
  maxWidth: "520px",
  margin: "0 auto",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  marginBottom: "20px",
  color: "#111827",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.5",
  marginBottom: "24px",
  color: "#374151",
};

const buttonWrapper = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#000",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: "bold" as const,
  display: "inline-block",
  fontSize: "16px",
};

const footer = {
  fontSize: "14px",
  color: "#6B7280",
  lineHeight: "1.5",
  marginBottom: "16px",
};

const urlText = {
  fontSize: "14px",
  color: "#9CA3AF",
  wordBreak: "break-word" as const,
};
