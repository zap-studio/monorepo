import {
  Categories,
  categoryFileLists,
  type FileList,
} from '@zap-ts/architecture';
import { FileListRenderer } from './file-entry';

export const categoryOrder = [
  'ROOT',
  'METADATA',
  'ERRORS',
  'IDE',
  'DOCKER',
  'CONFIG',
  'PAGES',
  'ROUTES',
  'COMPONENTS',
  'HOOKS',
  'LIBRARIES',
  'EMAILS',
  'MIDDLEWARE',
  'PROVIDERS',
  'INSTRUMENTATION',
  'ZAP',
] as const;

export function AllCategoryFileLists() {
  return (
    <>
      {categoryOrder.map((key) => (
        <CategoryFileList
          key={key}
          list={categoryFileLists[key]}
          category={key}
        />
      ))}
    </>
  );
}

export function CategoryFileList({
  list,
  category,
}: {
  list: FileList;
  category: keyof typeof Categories;
}) {
  return (
    <>
      <h3>{Categories[category].label}</h3>
      <FileListRenderer list={list} />
    </>
  );
}
