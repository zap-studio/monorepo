import { readFile, writeFile } from 'fs-extra';
import type { PackageJson } from 'type-fest';

export async function readPackageJson(
  path = 'package.json'
): Promise<PackageJson> {
  const data = await readFile(path, 'utf-8');
  return JSON.parse(data);
}

export async function writePackageJson(
  pkg: PackageJson,
  path = 'package.json'
): Promise<void> {
  const data = `${JSON.stringify(pkg, null, 2)}\n`;
  await writeFile(path, data, 'utf-8');
}

export function addDependency(
  pkg: PackageJson,
  name: string,
  version: string,
  dev = false
): PackageJson {
  const key = dev ? 'devDependencies' : 'dependencies';
  if (!pkg[key]) {
    pkg[key] = {};
  }
  if (typeof pkg[key] === 'object' && pkg[key] !== null) {
    (pkg[key] as Record<string, string>)[name] = version;
  }
  return pkg;
}

export function removeDependency(
  pkg: PackageJson,
  name: string,
  dev = false
): PackageJson {
  const key = dev ? 'devDependencies' : 'dependencies';
  if (pkg[key]?.[name]) {
    delete pkg[key]?.[name];
  }
  return pkg;
}
