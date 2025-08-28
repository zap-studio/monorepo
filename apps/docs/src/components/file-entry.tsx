import {
  IDEs,
  type FileStatus,
  type FileList,
  type IDE,
  type PluginId,
} from '@zap-ts/architecture';
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

const ideColorConfig: Record<IDE, string> = {
  vscode: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  cursor: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  zed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  windsurf: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
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
    <div className="flex flex-col py-2 gap-2">
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
              className={cn('text-xs', ideColorConfig[ide])}
              key={ide}
              variant="secondary"
            >
              <Code2 className="mr-1 h-3 w-3" /> {IDEs[ide].label}
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

export function FileListContainer({ children, className }: FileListProps) {
  return <div className={cn('flex flex-col', className)}>{children}</div>;
}

const statusOrder: Record<FileStatus, number> = {
  added: 0,
  modified: 1,
  deleted: 2,
};

type FileListRendererProps = {
  list: FileList;
  className?: string;
};

export function FileListRenderer({ list, className }: FileListRendererProps) {
  const sortedEntries = [...list.entries].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }
    return a.path.localeCompare(b.path);
  });

  return (
    <FileListContainer className={cn('flex flex-col gap-4', className)}>
      {sortedEntries.map((entry) => (
        <FileEntry
          key={entry.path}
          name={entry.path}
          status={entry.status}
          required={entry.required}
          plugins={entry.plugins}
          ide={entry.ide}
          folder={entry.folder}
        >
          {entry.children}
        </FileEntry>
      ))}
    </FileListContainer>
  );
}
