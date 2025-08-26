import {
  Code2,
  FileText,
  Folder,
  Package,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Status = 'added' | 'modified' | 'deleted';
type Requirement = 'required' | 'optional';
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
  requirement: Requirement;
  ide?: IDE[];
  plugins?: Plugin[];
  folder?: boolean;
  children?: React.ReactNode;
};

type StatusConfig = {
  icon: React.ElementType;
  color: string;
  badge: string;
};

const statusConfig: Record<Status, StatusConfig> = {
  added: {
    icon: Plus,
    color: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  modified: {
    icon: Pencil,
    color: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  deleted: {
    icon: Trash2,
    color: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
};

const requirementConfig: Record<Requirement, string> = {
  required: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  optional: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const ideConfig: Record<IDE, string> = {
  windsurf: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  cursor:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  vscode: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  zed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export function FileEntry({
  name,
  status,
  requirement,
  ide = [],
  plugins = [],
  folder,
  children,
}: FileEntryProps) {
  const cfg = statusConfig[status];
  const Icon = folder ? Folder : FileText;
  const StatusIcon = cfg.icon;

  return (
    <Card className="my-2 rounded-xl border border-muted shadow-sm">
      <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Icon + name + status */}
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{name}</span>
          <StatusIcon className={cn('h-4 w-4', cfg.color)} />
        </div>

        {/* Right: Badges */}
        <div className="flex flex-wrap justify-end gap-1">
          <Badge className={cn('text-xs', cfg.badge)} variant="outline">
            {status}
          </Badge>
          <Badge
            className={cn('text-xs', requirementConfig[requirement])}
            variant="outline"
          >
            {requirement}
          </Badge>
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
              <Package className="mr-1 h-3 w-3" /> {p}
            </Badge>
          ))}
        </div>
      </CardContent>

      {/* Description */}
      {children && (
        <div className="px-3 pb-3 text-muted-foreground text-sm">
          {children}
        </div>
      )}
    </Card>
  );
}
