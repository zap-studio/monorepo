export const Categories = {
  ROOT: { id: 'root', label: 'Root & Public' },
  METADATA: { id: 'metadata', label: 'Metadata' },
  ERRORS: { id: 'errors', label: 'Error Handling' },
  IDE: { id: 'ide', label: 'IDE Specific' },
  DOCKER: { id: 'docker', label: 'Docker' },
  CONFIG: { id: 'config', label: 'Configurations' },
  PAGES: { id: 'pages', label: 'Pages' },
  ROUTES: { id: 'routes', label: 'Routes' },
  COMPONENTS: { id: 'components', label: 'Components' },
  HOOKS: { id: 'hooks', label: 'Hooks' },
  LIBRARIES: { id: 'libs', label: 'Libraries' },
  EMAILS: { id: 'emails', label: 'Emails' },
  MIDDLEWARE: { id: 'middleware', label: 'Middleware' },
  PROVIDERS: { id: 'providers', label: 'Providers' },
  INSTRUMENTATION: { id: 'instrumentation', label: 'Instrumentation' },
  ZAP: { id: 'zap', label: 'Zap.ts Specific' },
} as const;

export type CategoryId = keyof typeof Categories;
export type Category = (typeof Categories)[CategoryId];
