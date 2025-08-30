import type { CategoryId, FileList } from '../types.js';
import { ComponentsFiles } from './components.js';
import { ConfigFiles } from './config.js';
import { DockerFiles } from './docker.js';
import { EmailsFiles } from './emails.js';
import { ErrorFiles } from './errors.js';
import { HooksFiles } from './hooks.js';
import { IdeFiles } from './ide.js';
import { InstrumentationFiles } from './instrumentation.js';
import { LibrariesFiles } from './libraries.js';
import { MetadataFiles } from './metadata.js';
import { MiddlewareFiles } from './middleware.js';
import { PagesFiles } from './pages.js';
import { ProvidersFiles } from './providers.js';
import { RootFiles } from './root.js';
import { RoutesFiles } from './routes.js';
import { ZapFiles } from './zap.js';

export const CategoryIds = [
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

export const Categories: Record<CategoryId, FileList> = {
  ROOT: RootFiles,
  METADATA: MetadataFiles,
  ERRORS: ErrorFiles,
  IDE: IdeFiles,
  DOCKER: DockerFiles,
  CONFIG: ConfigFiles,
  PAGES: PagesFiles,
  ROUTES: RoutesFiles,
  COMPONENTS: ComponentsFiles,
  HOOKS: HooksFiles,
  LIBRARIES: LibrariesFiles,
  EMAILS: EmailsFiles,
  MIDDLEWARE: MiddlewareFiles,
  PROVIDERS: ProvidersFiles,
  INSTRUMENTATION: InstrumentationFiles,
  ZAP: ZapFiles,
};
