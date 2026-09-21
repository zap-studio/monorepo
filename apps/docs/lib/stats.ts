import { packages } from "./packages.ts";

export interface Stats {
  downloads: number | null;
  stars: number | null;
}

const TIMEOUT_MS = 3000;

const readJson = async (url: string): Promise<unknown> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`${url} answered ${response.status}`);
  }
  return response.json();
};

const readStars = async (): Promise<number | null> => {
  try {
    const body = await readJson("https://api.github.com/repos/zap-studio/monorepo");
    // SAFETY: the field is read off the parsed body and type-checked below.
    const count = (body as { stargazers_count?: unknown }).stargazers_count;
    return typeof count === "number" ? count : null;
  } catch {
    return null;
  }
};

const readDownloads = async (): Promise<number | null> => {
  let total = 0;
  for (const entry of packages) {
    try {
      const body = await readJson(`https://api.npmjs.org/downloads/point/last-month/${entry.name}`);
      // SAFETY: the field is read off the parsed body and type-checked below.
      const count = (body as { downloads?: unknown }).downloads;
      if (typeof count !== "number") {
        return null;
      }
      total += count;
    } catch {
      return null;
    }
  }
  return total > 0 ? total : null;
};

export const loadStats = async (): Promise<Stats> => {
  const [downloads, stars] = await Promise.all([readDownloads(), readStars()]);
  return { downloads, stars };
};

export const formatCount = (count: number): string =>
  count < 1000 ? `${count}` : `${Math.floor(count / 1000)}k`;
