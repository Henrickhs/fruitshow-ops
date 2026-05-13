import { PageHeader } from '../components/PageHeader.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { Filters } from '../components/Filters.jsx';
import { Badge } from '../components/Badge.jsx';
import { CrudPanel } from '../components/CrudPanel.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useResource } from '../hooks/useResource.js';
import { br, formatDate } from '../lib/format.js';

const statusOptions = [
  { value: 'active', label: 'Ativa' },
  { value: 'inactive', label: 'Inativa' },
  { value: 'implantation', label: 'Implantação' }
];

export function Units() {
  const resource = useResource('/units');
  return (
    <>
      <PageHeader title="Unidades" subtitle="Cadastro, supervisão e situação operacional das franquias." />
      <CrudPanel
        title="Nova unidade"
        endpoint="/units"
        onSaved={resource.reload}
        fields={[
          { name: 'name', label: 'Nome', required: true },
          { name: 'cnpj', label: 'CNPJ', required: true },
          { name: 'responsibleName', label: 'Responsável', required: true },
          { name: 'address', label: 'Endereço', required: true },
          { name: 'city', label: 'Cidade', required: true },
          { name: 'state', label: 'UF', required: true },
          { name: 'phone', label: 'Telefone' },
          { name: 'status', label: 'Status', type: 'select', options: statusOptions, required: true },
          { name: 'openingDate', label: 'Data de abertura', type: 'date' }
        ]}
      />
      <Filters filters={resource.filters} setFilters={resource.setFilters}>
        <select className="field" value={resource.filters.status || ''} onChange={(event) => resource.setFilters((f) => ({ ...f, status: event.target.value, page: 1 }))}>
          <option value="">Todos os status</option>
          {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </Filters>
      <DataTable
        rows={resource.items}
        loading={resource.loading}
        columns={[
          { key: 'name', label: 'Unidade' },
          { key: 'city', label: 'Cidade/UF', render: (row) => `${row.city}/${row.state}` },
          { key: 'cnpj', label: 'CNPJ' },
          { key: 'status', label: 'Status', render: (row) => <Badge value={row.status} /> },
          { key: 'responsibleName', label: 'Responsável' },
          { key: 'supervisor', label: 'Supervisor', render: (row) => row.supervisor?.name || '-' },
          { key: 'openingDate', label: 'Abertura', render: (row) => formatDate(row.openingDate) }
        ]}
        empty="Nenhuma unidade encontrada."
      />
      <Pagination meta={resource.meta} setFilters={resource.setFilters} />
    </>
  );
}
