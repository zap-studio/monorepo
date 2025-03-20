import { readdirSync, statSync } from "fs";
import { join } from "path";

export const getAllFiles = (dir: string, fileList: string[] = []): string[] => {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
};
