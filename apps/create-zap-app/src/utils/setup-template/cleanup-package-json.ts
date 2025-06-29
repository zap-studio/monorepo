import path from 'node:path';
import fs from 'fs-extra';

export async function cleanupPackageJson(outputDir: string) {
  const packageJsonPath = path.join(outputDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    if (packageJson.packageManager) {
      packageJson.packageManager = undefined;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
  }
}
