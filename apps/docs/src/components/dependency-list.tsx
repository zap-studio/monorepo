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
        <li className="flex flex-col" key={dep.package}>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <a href={dep.link} rel="noopener noreferrer" target="_blank">
              {dep.package}
            </a>
            <span className="hidden sm:inline">–</span>
            <span className="text-muted-foreground text-sm">
              {dep.description}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
