import type { CategoryId, FileList } from '../types';
import { ComponentsFiles } from './components';
import { ConfigFiles } from './config';
import { DockerFiles } from './docker';
import { EmailsFiles } from './emails';
import { ErrorFiles } from './errors';
import { HooksFiles } from './hooks';
import { IdeFiles } from './ide';
import { InstrumentationFiles } from './instrumentation';
import { LibrariesFiles } from './libraries';
import { MetadataFiles } from './metadata';
import { MiddlewareFiles } from './middleware';
import { PagesFiles } from './pages';
import { ProvidersFiles } from './providers';
import { RootFiles } from './root';
import { RoutesFiles } from './routes';
import { ZapFiles } from './zap';

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
