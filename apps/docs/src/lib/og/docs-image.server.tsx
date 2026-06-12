import "@tanstack/react-start/server-only";
import { ImageResponse } from "@takumi-rs/image-response";
import { generate as DefaultImage } from "fumadocs-ui/og/takumi";

interface DocsOgImageOptions {
  description?: string;
  title: string;
}

export function createDocsOgImageResponse({
  description,
  title,
}: DocsOgImageOptions): ImageResponse {
  return new ImageResponse(
    <DefaultImage description={description} site="Zap Studio" title={title} />,
    {
      format: "webp",
      headers: {
        "cache-control": "public, max-age=0, s-maxage=86400",
      },
      height: 630,
      width: 1200,
    }
  );
}
