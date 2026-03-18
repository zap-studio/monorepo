import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

export interface ChangelogVersion {
  rawMarkdown: string;
  releaseDate: string | null;
  version: string;
}

export interface PackageChangelog {
  packageName: string;
  rawMarkdown: string;
  slug: string;
  versions: ChangelogVersion[];
}

let changelogCache: Promise<PackageChangelog[]> | undefined;
const execFileAsync = promisify(execFile);
const commitDateCache = new Map<string, string | null>();
const PACKAGE_SCOPE_PREFIX_REGEX = /^@zap-studio\//;
const VERSION_COMMIT_HASH_REGEX = /^\s*-\s+([a-f0-9]{7,40}):/m;
const VERSION_HEADER_REGEX = /^##\s+([^\n]+)$/gm;

export function getReleasedPackageChangelogs(): Promise<PackageChangelog[]> {
  if (!changelogCache) {
    changelogCache = loadReleasedPackageChangelogs().catch((error: unknown) => {
      changelogCache = undefined;
      throw error;
    });
  }

  return changelogCache;
}

export async function getPackageChangelogBySlug(slug: string): Promise<PackageChangelog | null> {
  const changelogs = await getReleasedPackageChangelogs();

  return changelogs.find((entry) => entry.slug === slug) ?? null;
}

async function loadReleasedPackageChangelogs(): Promise<PackageChangelog[]> {
  const packagesDir = await resolvePackagesDir();
  const dirEntries = await fs.readdir(packagesDir, { withFileTypes: true });
  const changelogs: PackageChangelog[] = [];

  for (const entry of dirEntries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const slug = entry.name;
    const packageDir = path.join(packagesDir, slug);
    const packageJsonPath = path.join(packageDir, "package.json");
    const changelogPath = path.join(packageDir, "CHANGELOG.md");

    if (!((await pathExists(packageJsonPath)) && (await pathExists(changelogPath)))) {
      continue;
    }

    const packageJsonRaw = await fs.readFile(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonRaw) as { name?: string };
    const packageName = packageJson.name?.trim();

    if (!packageName) {
      continue;
    }

    const rawMarkdown = await fs.readFile(changelogPath, "utf8");
    const versions = await parseVersions(rawMarkdown);

    changelogs.push({
      slug,
      packageName: toDisplayPackageName(packageName),
      rawMarkdown,
      versions,
    });
  }

  return changelogs.sort((a, b) =>
    a.packageName.localeCompare(b.packageName, "en", {
      sensitivity: "base",
    }),
  );
}

async function parseVersions(markdown: string): Promise<ChangelogVersion[]> {
  const content = markdown.replace(/\r\n/g, "\n");
  const matches = [...content.matchAll(VERSION_HEADER_REGEX)];
  const versions: ChangelogVersion[] = [];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const version = match[1]?.trim();
    if (!version) {
      continue;
    }

    const currentMatchIndex = match.index ?? 0;
    const lineEnd = content.indexOf("\n", currentMatchIndex);
    const sectionStart = lineEnd === -1 ? content.length : lineEnd + 1;
    const sectionEnd = matches[index + 1]?.index ?? content.length;
    const rawMarkdown = content.slice(sectionStart, sectionEnd).trim();
    const commitHash = extractVersionCommitHash(rawMarkdown);
    const releaseDate = commitHash ? await getCommitDate(commitHash) : null;

    versions.push({
      version,
      rawMarkdown,
      releaseDate,
    });
  }

  return versions;
}

async function resolvePackagesDir(): Promise<string> {
  const candidates = [
    path.resolve(process.cwd(), "../../packages"),
    path.resolve(process.cwd(), "packages"),
  ];

  for (const candidate of candidates) {
    try {
      const stats = await fs.stat(candidate);
      if (stats.isDirectory()) {
        return candidate;
      }
    } catch {
      // Try next candidate.
    }
  }

  throw new Error("Unable to resolve the monorepo packages directory.");
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function toDisplayPackageName(packageName: string): string {
  return packageName.replace(PACKAGE_SCOPE_PREFIX_REGEX, "");
}

function extractVersionCommitHash(versionMarkdown: string): string | null {
  const match = versionMarkdown.match(VERSION_COMMIT_HASH_REGEX);
  return match?.[1] ?? null;
}

async function getCommitDate(commitHash: string): Promise<string | null> {
  if (commitDateCache.has(commitHash)) {
    return commitDateCache.get(commitHash) ?? null;
  }

  try {
    const { stdout } = await execFileAsync("git", ["show", "-s", "--format=%cI", commitHash]);
    const isoDate = stdout.trim();
    const value = isoDate.length > 0 ? isoDate : null;
    commitDateCache.set(commitHash, value);
    return value;
  } catch {
    commitDateCache.set(commitHash, null);
    return null;
  }
}
