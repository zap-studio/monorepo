import { readFile, writeFile } from 'fs-extra';
import type { PackageJson } from 'type-fest';

export async function readPackageJson(
  path = 'package.json'
): Promise<PackageJson> {
  return JSON.parse(await readFile(path, 'utf-8'));
}

export async function writePackageJson(
  pkg: PackageJson,
  path = 'package.json'
): Promise<void> {
  await writeFile(path, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8');
}

type DependencyAction = 'add' | 'remove';

async function updateDependencies(opts: {
  pkg: PackageJson;
  path: string;
  deps: Record<string, string>;
  dev?: boolean;
  action: DependencyAction;
}): Promise<void> {
  const key = opts.dev ? 'devDependencies' : 'dependencies';
  opts.pkg[key] ||= {};

  const target = opts.pkg[key] as Record<string, string>;

  for (const [name, version] of Object.entries(opts.deps)) {
    if (opts.action === 'add') {
      target[name] = version;
    } else {
      delete target[name];
    }
  }

  await writePackageJson(opts.pkg, opts.path);
}

export async function addDependency(opts: {
  pkg: PackageJson;
  path: string;
  name: string;
  version: string;
  dev?: boolean;
}): Promise<void> {
  await updateDependencies({
    pkg: opts.pkg,
    path: opts.path,
    deps: { [opts.name]: opts.version },
    dev: opts.dev,
    action: 'add',
  });
}

export async function removeDependency(opts: {
  pkg: PackageJson;
  path: string;
  name: string;
  dev?: boolean;
}): Promise<void> {
  await updateDependencies({
    pkg: opts.pkg,
    path: opts.path,
    deps: { [opts.name]: '' },
    dev: opts.dev,
    action: 'remove',
  });
}

export async function addDependencies(opts: {
  pkg: PackageJson;
  path: string;
  deps: Record<string, string>;
  dev?: boolean;
}): Promise<void> {
  await updateDependencies({
    pkg: opts.pkg,
    path: opts.path,
    deps: opts.deps,
    dev: opts.dev,
    action: 'add',
  });
}

export async function removeDependencies(opts: {
  pkg: PackageJson;
  path: string;
  deps: Record<string, string>;
  dev?: boolean;
}): Promise<void> {
  await updateDependencies({
    pkg: opts.pkg,
    path: opts.path,
    deps: opts.deps,
    dev: opts.dev,
    action: 'remove',
  });
}
