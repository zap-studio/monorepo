/**
 * Non-exhaustive: used to detect common multipart public suffixes for subdomain checks.
 */
export const MULTIPART_LTDS: Set<string> = new Set([
  "co.uk",
  "org.uk",
  "gov.uk",
  "ac.uk",
  "sch.uk",
  "net.uk",
  "co.jp",
  "ne.jp",
  "or.jp",
  "com.au",
  "net.au",
  "org.au",
  "com.br",
  "net.br",
  "org.br",
]);
