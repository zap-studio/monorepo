import type { ReactNode } from 'react';
import type { Categories } from './categories';
import type { IDEs } from './ide';
import type { Plugins } from './plugins';

export type FileStatus = 'added' | 'deleted' | 'modified';

export type FileEntry = {
  path: string;
  children?: ReactNode;
  status: FileStatus;
  required: boolean;
  folder?: boolean;
  ide?: IDE;
  plugins?: PluginId[];
};

export type FileList = {
  category: Category;
  entries: FileEntry[];
};

export type PluginId = keyof typeof Plugins;
export type Plugin = (typeof Plugins)[PluginId];

export type IDE = keyof typeof IDEs;

export type CategoryId = keyof typeof Categories;
export type Category = (typeof Categories)[CategoryId];
