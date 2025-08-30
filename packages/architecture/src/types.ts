import type { ReactNode } from 'react';
import type { Dependencies, Packages } from './deps.js';
import type { CategoryIds } from './files/index.js';
import type { IDEs } from './ide.js';
import type { Plugins } from './plugins.js';

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
  category: CategoryId;
  entries: FileEntry[];
};

export type PluginId = keyof typeof Plugins;
export type Plugin = (typeof Plugins)[PluginId];

export type IDE = keyof typeof IDEs;

export type CategoryId = (typeof CategoryIds)[number];

export type PackageId = (typeof Packages)[number];
export type Dependency = (typeof Dependencies)[number];
