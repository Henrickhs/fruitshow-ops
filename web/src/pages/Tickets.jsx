import { PageHeader } from '../components/PageHeader.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { Filters } from '../components/Filters.jsx';
import { Badge } from '../components/Badge.jsx';
import { CrudPanel } from '../components/CrudPanel.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useResource } from '../hooks/useResource.js';
import { br, formatDate } from '../lib/format.js';

const priorities = ['low', 'medium', 'high', 'critical'].map((value) => ({ value, label: br(value) }));
const categories = ['equipment', 'operational', 'financial', 'other'].map((value) => ({ value, label: br(value) }));
const statuses = ['open', 'in_progress', 'resolved', 'closed'].map((value) => ({ value, label: br(value) }));

export function Tickets() {
  const resource = useResource('/tickets');
  return (
    <>
      <PageHeader title="Chamados" subtitle="Abertura, priorização e acompanhamento de solicitações operacionais." />
      <CrudPanel
        title="Novo chamado"
        endpoint="/tickets"
        onSaved={resource.reload}
        fields={[
          { name: 'title', label: 'Título', required: true },
          { name: 'unitId', label: 'ID da unidade', required: true },
          { name: 'category', label: 'Categoria', type: 'select', options: categories, required: true },
          { name: 'priority', label: 'Prioridade', type: 'select', options: priorities, required: true },
          { name: 'description', label: 'Descrição', type: 'textarea', required: true }
        ]}
      />
      <Filters filters={resource.filters} setFilters={resource.setFilters}>
        <select className="field" value={resource.filters.status || ''} onChange={(event) => resource.setFilters((f) => ({ ...f, status: event.target.value, page: 1 }))}>
          <option value="">Status</option>
          {statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <select className="field" value={resource.filters.priority || ''} onChange={(event) => resource.setFilters((f) => ({ ...f, priority: event.target.value, page: 1 }))}>
          <option value="">Prioridade</option>
          {priorities.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </Filters>
      <DataTable
        rows={resource.items}
        loading={resource.loading}
        columns={[
          { key: 'title', label: 'Chamado' },
          { key: 'unit', label: 'Unidade', render: (row) => row.unit?.name || '-' },
          { key: 'category', label: 'Categoria', render: (row) => br(row.category) },
          { key: 'priority', label: 'Prioridade', render: (row) => <Badge value={row.priority} /> },
          { key: 'status', label: 'Status', render: (row) => <Badge value={row.status} /> },
          { key: 'assignedTo', label: 'Responsável', render: (row) => row.assignedTo?.name || '-' },
          { key: 'createdAt', label: 'Criado em', render: (row) => formatDate(row.createdAt) }
        ]}
        empty="Nenhum chamado encontrado."
      />
      <Pagination meta={resource.meta} setFilters={resource.setFilters} />
    </>
  );
}
