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

export default function MagicLinkMail({ url }: MailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your sign-in link to Zap.ts</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Your Magic Link to Zap.ts</Text>

          <Text style={paragraph}>
            Tap the button below to sign in. This link will expire in 15
            minutes.
          </Text>

          <Section style={buttonWrapper}>
            <Button href={url} style={button}>
              Sign In Now
            </Button>
          </Section>

          <Text style={footer}>
            Didn&apos;t request this link? You can safely ignore this email.
          </Text>

          <Text style={urlText}>
            If the button doesn&apos;t work, copy and paste this link into your
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
  padding: "40px",
  borderRadius: "8px",
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
  color: "#374151",
  lineHeight: "1.5",
  marginBottom: "24px",
};

const buttonWrapper = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#000",
  color: "#fff",
  fontSize: "16px",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: "bold" as const,
  display: "inline-block",
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
