import type { ReactNode } from 'react';
import type { Category } from './categories';
import type { IDE } from './ide';
import type { PluginId } from './plugins';

export type FileStatus = 'added' | 'deleted' | 'modified';

export interface FileEntry {
  path: string;
  children?: ReactNode;
  status: FileStatus;
  required: boolean;
  folder?: boolean;
  ide?: IDE;
  plugins?: PluginId[];
}

export interface FileList {
  category: Category;
  entries: FileEntry[];
}
