/** biome-ignore-all lint/performance/noBarrelFile: This file serves as the main entry point for categories, this is intentional and necessary. */

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

export const categoryFileLists = {
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
} as const;
