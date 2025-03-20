import { execSync } from "child_process";

export const generateBetterAuthSecret = (): string => {
  try {
    const secret = execSync("openssl rand -base64 32", {
      encoding: "utf-8",
    }).trim();
    return secret;
  } catch {
    console.warn(
      "Failed to generate BETTER_AUTH_SECRET using openssl. Using a fallback value.",
    );
    return Buffer.from(
      Math.random().toString(36).slice(2) + Date.now().toString(36),
    )
      .toString("base64")
      .slice(0, 43);
  }
};
