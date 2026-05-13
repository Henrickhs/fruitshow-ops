import { PageHeader } from '../components/PageHeader.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { Filters } from '../components/Filters.jsx';
import { Badge } from '../components/Badge.jsx';
import { CrudPanel } from '../components/CrudPanel.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useResource } from '../hooks/useResource.js';
import { br, formatDate } from '../lib/format.js';

const statuses = ['planning', 'in_progress', 'on_hold', 'concluded'].map((value) => ({ value, label: br(value) }));

export function Projects() {
  const resource = useResource('/projects');
  return (
    <>
      <PageHeader title="Projetos" subtitle="Projetos por unidade ou rede, tarefas atribuídas, prazos e quadro Kanban simplificado." />
      <CrudPanel
        title="Novo projeto"
        endpoint="/projects"
        onSaved={resource.reload}
        fields={[
          { name: 'title', label: 'Título', required: true },
          { name: 'responsibleId', label: 'ID do responsável', required: true },
          { name: 'unitId', label: 'ID da unidade (opcional)' },
          { name: 'status', label: 'Status', type: 'select', options: statuses, required: true },
          { name: 'startDate', label: 'Início', type: 'date' },
          { name: 'dueDate', label: 'Prazo', type: 'date' },
          { name: 'description', label: 'Descrição', type: 'textarea' }
        ]}
      />
      <Filters filters={resource.filters} setFilters={resource.setFilters}>
        <select className="field" value={resource.filters.status || ''} onChange={(event) => resource.setFilters((f) => ({ ...f, status: event.target.value, page: 1 }))}>
          <option value="">Todos os status</option>
          {statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </Filters>
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        {['todo', 'doing', 'done'].map((status) => (
          <div key={status} className="surface rounded-lg p-4">
            <p className="mb-3 text-sm font-black">{br(status)}</p>
            <div className="space-y-2">
              {resource.items.flatMap((project) => project.tasks || []).filter((task) => task.status === status).slice(0, 5).map((task) => (
                <div key={task.id} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">{task.title}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <DataTable
        rows={resource.items}
        loading={resource.loading}
        columns={[
          { key: 'title', label: 'Projeto' },
          { key: 'unit', label: 'Unidade', render: (row) => row.unit?.name || 'Rede' },
          { key: 'responsible', label: 'Responsável', render: (row) => row.responsible?.name || '-' },
          { key: 'status', label: 'Status', render: (row) => <Badge value={row.status} /> },
          { key: 'tasks', label: 'Tarefas', render: (row) => row.tasks?.length || 0 },
          { key: 'dueDate', label: 'Prazo', render: (row) => formatDate(row.dueDate) }
        ]}
        empty="Nenhum projeto encontrado."
      />
      <Pagination meta={resource.meta} setFilters={resource.setFilters} />
    </>
  );
}
