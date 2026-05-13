import { PageHeader } from '../components/PageHeader.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { Filters } from '../components/Filters.jsx';
import { Badge } from '../components/Badge.jsx';
import { CrudPanel } from '../components/CrudPanel.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useResource } from '../hooks/useResource.js';
import { br, formatDate } from '../lib/format.js';

const statuses = ['in_progress', 'validation', 'concluded'].map((value) => ({ value, label: br(value) }));

export function Checklist() {
  const resource = useResource('/checklist/executions');
  return (
    <>
      <PageHeader title="Checklist" subtitle="Templates, execuções, pontuação e validação das avaliações de unidade." />
      <CrudPanel
        title="Nova execução"
        endpoint="/checklist/executions"
        onSaved={resource.reload}
        fields={[
          { name: 'unitId', label: 'ID da unidade', required: true },
          { name: 'questionnaireId', label: 'ID do questionário', required: true }
        ]}
      />
      <div className="surface mb-5 rounded-lg p-5">
        <p className="text-sm font-bold text-slate-800">Templates de questionário</p>
        <p className="mt-1 text-sm text-slate-500">Use a rota `POST /checklist/questionnaires` para criar perguntas dos tipos sim/não, múltipla escolha, numérico, texto e foto.</p>
      </div>
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
          { key: 'questionnaire', label: 'Questionário', render: (row) => row.questionnaire?.title || '-' },
          { key: 'unit', label: 'Unidade', render: (row) => row.unit?.name || '-' },
          { key: 'status', label: 'Status', render: (row) => <Badge value={row.status} /> },
          { key: 'scorePercentage', label: 'Nota', render: (row) => `${row.scorePercentage}%` },
          { key: 'executedBy', label: 'Executado por', render: (row) => row.executedBy?.name || '-' },
          { key: 'createdAt', label: 'Criado em', render: (row) => formatDate(row.createdAt) }
        ]}
        empty="Nenhuma avaliação encontrada."
      />
      <Pagination meta={resource.meta} setFilters={resource.setFilters} />
    </>
  );
}
