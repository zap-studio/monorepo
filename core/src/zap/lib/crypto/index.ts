export const algorithm = "aes-256-cbc";
export const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
export const ivLength = 16;
