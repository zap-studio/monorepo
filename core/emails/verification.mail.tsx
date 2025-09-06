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

export default function VerificationMail({ url }: MailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Verify your email address</Text>

          <Text style={paragraph}>
            Thanks for signing up! Click the button below to confirm your email
            and activate your account.
          </Text>

          <Section style={buttonWrapper}>
            <Button href={url} style={button}>
              Verify Email
            </Button>
          </Section>

          <Text style={footer}>
            If you didn&apos;t sign up, you can safely ignore this email.
          </Text>

          <Text style={urlText}>
            Or copy and paste this link into your browser:
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
  padding: "40px",
  borderRadius: "8px",
  maxWidth: "520px",
  margin: "0 auto",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  color: "#111827",
  marginBottom: "20px",
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
  marginBottom: "16px",
  lineHeight: "1.5",
};

const urlText = {
  fontSize: "14px",
  color: "#9CA3AF",
  wordBreak: "break-word" as const,
};
