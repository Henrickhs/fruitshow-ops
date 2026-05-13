export function DataTable({ columns, rows, loading, empty = 'Nenhum registro encontrado.' }) {
  if (loading) {
    return <div className="surface rounded-lg p-8 text-sm text-slate-500">Carregando dados...</div>;
  }

  if (!rows?.length) {
    return <div className="surface rounded-lg p-8 text-sm text-slate-500">{empty}</div>;
  }

  return (
    <div className="surface overflow-hidden rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-bold">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-top text-slate-700">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
