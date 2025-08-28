export type Dependency = {
  package: string;
  description: string;
  link: string;
};

export type DependencyGroup = {
  label: string;
  dependencies: readonly Dependency[];
};

export function DependencyList({ deps }: { deps: DependencyGroup }) {
  return (
    <ul className="space-y-4">
      {deps.dependencies.map((dep) => (
        <li key={dep.package} className="flex flex-col">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <a href={dep.link} target="_blank" rel="noopener noreferrer">
              {dep.package}
            </a>
            <span className="hidden sm:inline">–</span>
            <span className="text-sm text-muted-foreground">
              {dep.description}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
