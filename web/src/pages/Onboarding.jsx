import { PageHeader } from '../components/PageHeader.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { Filters } from '../components/Filters.jsx';
import { Badge } from '../components/Badge.jsx';
import { CrudPanel } from '../components/CrudPanel.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useResource } from '../hooks/useResource.js';
import { br, formatDate } from '../lib/format.js';

const statuses = ['pending', 'in_progress', 'completed'].map((value) => ({ value, label: br(value) }));

function progress(plan) {
  const total = plan.steps?.length || 0;
  if (!total) return 0;
  return Math.round((plan.steps.filter((step) => step.status === 'completed').length / total) * 100);
}

export function Onboarding() {
  const resource = useResource('/onboarding/plans');
  return (
    <>
      <PageHeader title="Implantação de unidades" subtitle="Planos padronizados de abertura, etapas por categoria e visão de progresso." />
      <CrudPanel
        title="Novo plano de implantação"
        endpoint="/onboarding/plans"
        onSaved={resource.reload}
        fields={[
          { name: 'unitId', label: 'ID da unidade', required: true },
          { name: 'responsibleId', label: 'ID do responsável', required: true },
          { name: 'startDate', label: 'Início', type: 'date' },
          { name: 'expectedCompletionDate', label: 'Previsão de conclusão', type: 'date' }
        ]}
      />
      <Filters filters={resource.filters} setFilters={resource.setFilters}>
        <select className="field" value={resource.filters.status || ''} onChange={(event) => resource.setFilters((f) => ({ ...f, status: event.target.value, page: 1 }))}>
          <option value="">Todos os status</option>
          {statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </Filters>
      <DataTable
        rows={resource.items}
        loading={resource.loading}
        columns={[
          { key: 'unit', label: 'Unidade', render: (row) => row.unit?.name || '-' },
          { key: 'responsible', label: 'Responsável', render: (row) => row.responsible?.name || '-' },
          { key: 'status', label: 'Status', render: (row) => <Badge value={row.status} /> },
          { key: 'progress', label: 'Progresso', render: (row) => <div className="w-40"><div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-folha" style={{ width: `${progress(row)}%` }} /></div><span className="text-xs">{progress(row)}%</span></div> },
          { key: 'startDate', label: 'Início', render: (row) => formatDate(row.startDate) },
          { key: 'expectedCompletionDate', label: 'Previsão', render: (row) => formatDate(row.expectedCompletionDate) }
        ]}
        empty="Nenhum plano de implantação encontrado."
      />
      <Pagination meta={resource.meta} setFilters={resource.setFilters} />
    </>
  );
}
