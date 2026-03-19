import type { GitHubStats } from "@/lib/github/github";

const RELEASES_LAST_PAGE_RE = /page=(\d+)>; rel="last"/;
const FALLBACK_STATS: GitHubStats = {
  stars: 153,
  issues: 0,
  releases: 12,
};

export async function getGitHubStats(): Promise<GitHubStats> {
  try {
    const [repoRes, releasesRes] = await Promise.all([
      fetch("https://api.github.com/repos/zap-studio/monorepo", {
        cache: "force-cache",
        headers: { Accept: "application/vnd.github+json" },
      }),
      fetch("https://api.github.com/repos/zap-studio/monorepo/releases?per_page=1", {
        cache: "force-cache",
        headers: { Accept: "application/vnd.github+json" },
      }),
    ]);

    if (!(repoRes.ok && releasesRes.ok)) {
      return FALLBACK_STATS;
    }

    const repo = await repoRes.json();
    const linkHeader = releasesRes.headers.get("link") ?? "";
    const match = linkHeader.match(RELEASES_LAST_PAGE_RE);
    const releases = match ? Number.parseInt(match[1], 10) : FALLBACK_STATS.releases;

    return {
      stars: repo.stargazers_count as number,
      issues: repo.open_issues_count as number,
      releases,
    };
  } catch {
    return FALLBACK_STATS;
  }
}
