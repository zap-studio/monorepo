import fs from "fs-extra";
import type { PackageJson } from "type-fest";

export async function readPackageJson(
  path = "package.json"
): Promise<PackageJson> {
  return JSON.parse(await fs.readFile(path, "utf-8"));
}

export async function writePackageJson(
  pkg: PackageJson,
  path = "package.json"
): Promise<void> {
  await fs.writeFile(path, `${JSON.stringify(pkg, null, 2)}\n`, "utf-8");
}

type DependencyAction = "add" | "remove";

async function updateDependencies(opts: {
  path: string;
  deps: Record<string, string>;
  dev?: boolean;
  action: DependencyAction;
}): Promise<void> {
  const pkg = await readPackageJson(opts.path);
  const key = opts.dev ? "devDependencies" : "dependencies";
  pkg[key] ||= {};

  const target = pkg[key] as Record<string, string>;

  for (const [name, version] of Object.entries(opts.deps)) {
    if (opts.action === "add") {
      target[name] = version;
    } else {
      delete target[name];
    }
  }

  await writePackageJson(pkg, opts.path);
}

export async function addDependency(opts: {
  path: string;
  name: string;
  version: string;
  dev?: boolean;
}): Promise<void> {
  await updateDependencies({
    path: opts.path,
    deps: { [opts.name]: opts.version },
    dev: opts.dev,
    action: "add",
  });
}

export async function removeDependency(opts: {
  path: string;
  name: string;
  dev?: boolean;
}): Promise<void> {
  await updateDependencies({
    path: opts.path,
    deps: { [opts.name]: "" },
    dev: opts.dev,
    action: "remove",
  });
}

export async function addDependencies(opts: {
  path: string;
  deps: Record<string, string>;
  dev?: boolean;
}): Promise<void> {
  await updateDependencies({
    path: opts.path,
    deps: opts.deps,
    dev: opts.dev,
    action: "add",
  });
}

export async function removeDependencies(opts: {
  path: string;
  deps: Record<string, string>;
  dev?: boolean;
}): Promise<void> {
  await updateDependencies({
    path: opts.path,
    deps: opts.deps,
    dev: opts.dev,
    action: "remove",
  });
}

type ScriptAction = "add" | "remove";

async function updateScripts(opts: {
  path: string;
  scripts: Record<string, string>;
  action: ScriptAction;
}): Promise<void> {
  const pkg = await readPackageJson(opts.path);
  pkg.scripts ||= {};

  for (const [name, command] of Object.entries(opts.scripts)) {
    if (opts.action === "add") {
      pkg.scripts[name] = command;
    } else {
      delete pkg.scripts[name];
    }
  }

  await writePackageJson(pkg, opts.path);
}

export async function addScript(opts: {
  path: string;
  key: string;
  script: string;
}): Promise<void> {
  await updateScripts({
    path: opts.path,
    scripts: { [opts.key]: opts.script },
    action: "add",
  });
}

export async function removeScript(opts: {
  path: string;
  key: string;
}): Promise<void> {
  await updateScripts({
    path: opts.path,
    scripts: { [opts.key]: "" },
    action: "remove",
  });
}

export async function addScripts(opts: {
  path: string;
  scripts: Record<string, string>;
}): Promise<void> {
  await updateScripts({
    path: opts.path,
    scripts: opts.scripts,
    action: "add",
  });
}

export async function removeScripts(opts: {
  path: string;
  keys: string[];
}): Promise<void> {
  const scripts = Object.fromEntries(opts.keys.map((key) => [key, ""]));
  await updateScripts({
    path: opts.path,
    scripts,
    action: "remove",
  });
}
