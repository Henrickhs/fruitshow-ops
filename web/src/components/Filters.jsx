import { Search } from 'lucide-react';

export function Filters({ filters, setFilters, children }) {
  return (
    <div className="surface mb-5 flex flex-col gap-3 rounded-lg p-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input
          className="field w-full pl-9"
          placeholder="Buscar por nome, título ou responsável"
          value={filters.search || ''}
          onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
        />
      </div>
      {children}
    </div>
  );
}
