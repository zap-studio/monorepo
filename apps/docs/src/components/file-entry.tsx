import { Code2, FileText, Folder, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Status = 'added' | 'modified' | 'deleted';
type IDE = 'windsurf' | 'cursor' | 'vscode' | 'zed';
type Plugin =
  | 'ai'
  | 'analytics'
  | 'api'
  | 'auth'
  | 'blog'
  | 'components'
  | 'crypto'
  | 'db'
  | 'env'
  | 'errors'
  | 'feedbacks'
  | 'flags'
  | 'landing'
  | 'legal'
  | 'mails'
  | 'markdown'
  | 'payments'
  | 'plugins'
  | 'pwa'
  | 'sidebar'
  | 'waitlist';

type FileEntryProps = {
  name: string;
  status: Status;
  required: boolean;
  ide?: IDE[];
  plugins?: Plugin[];
  folder?: boolean;
  children?: React.ReactNode;
};

const statusDotConfig: Record<Status, string> = {
  added: '🟢',
  modified: '🟡',
  deleted: '🔴',
};

const ideConfig: Record<IDE, string> = {
  windsurf: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  cursor: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  vscode: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  zed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export function FileEntry({
  name,
  status,
  required,
  ide = [],
  plugins = [],
  folder,
  children,
}: FileEntryProps) {
  const Icon = folder ? Folder : FileText;

  return (
    <div className="flex flex-col border-muted/40 border-b py-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-foreground" />
          <span className="font-mono text-sm">{name}</span>
          <span className="text-sm">{statusDotConfig[status]}</span>
        </div>

        <div className="flex flex-wrap gap-1 sm:justify-end">
          {required && (
            <Badge
              className={cn(
                'text-xs',
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              )}
              variant="outline"
            >
              Required
            </Badge>
          )}

          {ide.map((i) => (
            <Badge
              className={cn('text-xs', ideConfig[i])}
              key={i}
              variant="secondary"
            >
              <Code2 className="mr-1 h-3 w-3" /> {i}
            </Badge>
          ))}

          {plugins.map((p) => (
            <Badge
              className="bg-yellow-100 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              key={p}
              variant="secondary"
            >
              <Package className="h-3 w-3" /> {p}
            </Badge>
          ))}
        </div>
      </div>

      {children && (
        <div className="mt-1 pl-6 text-muted-foreground text-sm">
          {children}
        </div>
      )}
    </div>
  );
}

type FileListProps = {
  children: React.ReactNode;
  className?: string;
};

export function FileList({ children, className }: FileListProps) {
  return (
    <div className={cn('flex flex-col divide-y divide-muted/40', className)}>
      {children}
    </div>
  );
}
