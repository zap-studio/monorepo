import type { FileList, FileStatus } from '@zap-ts/architecture';
import { FileEntry, FileList as FileListContainer } from './file-entry';
import { cn } from '@/lib/utils';

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
