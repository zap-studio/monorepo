import type { FileStatus, IDE, PluginId } from '@zap-ts/architecture';
import { Code2, FileText, Folder, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type FileEntryProps = {
  name: string;
  status: FileStatus;
  required: boolean;
  plugins?: PluginId[];
  ide?: IDE;
  folder?: boolean;
  children?: React.ReactNode;
};

const statusDotConfig: Record<FileStatus, string> = {
  added: '🟢',
  modified: '🟡',
  deleted: '🔴',
};

const ideConfig: Record<IDE, { color: string; label: string }> = {
  windsurf: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    label: 'Windsurf',
  },
  cursor: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    label: 'Cursor',
  },
  vscode: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    label: 'VS Code',
  },
  zed: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    label: 'Zed',
  },
};

export function FileEntry({
  name,
  status,
  required,
  plugins = [],
  ide,
  folder,
  children,
}: FileEntryProps) {
  const Icon = folder ? Folder : FileText;

  return (
    <div className="flex flex-col py-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex xs:flex-row flex-col xs:items-center gap-2 xs:gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Icon className="h-4 w-4 text-foreground" />
            <span className="font-medium text-sm md:text-base">{name}</span>
            <span className="text-sm">{statusDotConfig[status]}</span>
          </div>
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

          {ide && (
            <Badge
              className={cn('text-xs', ideConfig[ide].color)}
              key={ide}
              variant="secondary"
            >
              <Code2 className="mr-1 h-3 w-3" /> {ideConfig[ide].label}
            </Badge>
          )}

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
        <div className="pl-2 text-muted-foreground text-sm sm:pl-6">
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
  return <div className={cn('flex flex-col', className)}>{children}</div>;
}
