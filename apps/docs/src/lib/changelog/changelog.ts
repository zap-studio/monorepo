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
