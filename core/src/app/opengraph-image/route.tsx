import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { ZAP_DEFAULT_METADATA } from "@/zap.config";

const SIZE = {
  width: 1200,
  height: 630,
};

const FONT_PATHS = {
  GEIST_REGULAR: "public/fonts/Geist-Regular.ttf",
  GEIST_SEMIBOLD: "public/fonts/Geist-SemiBold.ttf",
};

const SEPARATORS_REGEX = /[|•·—–-]/;

export async function GET(request: Request) {
  const url = new URL(request.url);

  const titleParam = url.searchParams.get("title");
  const title =
    titleParam ||
    String(ZAP_DEFAULT_METADATA.openGraph?.title).split(
      SEPARATORS_REGEX
    )?.[0] ||
    "Zap.ts";

  const [geist, geistSemiBold] = await Promise.all([
    readFile(join(process.cwd(), FONT_PATHS.GEIST_REGULAR)),
    readFile(join(process.cwd(), FONT_PATHS.GEIST_SEMIBOLD)),
  ]);

  return new ImageResponse(
    <div tw="flex flex-col w-full h-full items-center justify-center bg-black">
      <div tw="flex flex-col py-12 px-8 text-left justify-center">
        <h2
          style={{
            color: "#e6d63b",
            fontFamily: "Geist SemiBold, sans-serif",
          }}
          tw="text-6xl font-semibold"
        >
          {String(title)}
        </h2>
      </div>
    </div>,
    {
      width: SIZE.width,
      height: SIZE.height,
      fonts: [
        {
          name: "Geist",
          data: geist,
          style: "normal",
          weight: 400,
        },
        {
          name: "Geist SemiBold",
          data: geistSemiBold,
          style: "normal",
          weight: 600,
        },
      ],
    }
  );
}
