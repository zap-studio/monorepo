import type { PACKAGE_MANAGERS } from "@/data/package-manager";

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];
