import { ImageResponse } from "next/og";

import { ZAP_DEFAULT_METADATA } from "@/zap.config";

export function GET(request: Request) {
  const url = new URL(request.url);
  const title =
    url.searchParams.get("title") ||
    `${ZAP_DEFAULT_METADATA.openGraph?.title} - ${ZAP_DEFAULT_METADATA.openGraph?.description}`;

  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full items-center justify-center bg-slate-900">
        <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8">
          <h2
            tw="flex flex-col text-4xl font-bold tracking-tight text-left"
            style={{ color: "#e6d63b" }}
          >
            {title}
          </h2>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
