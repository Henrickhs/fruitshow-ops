import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { Filters } from '../components/Filters.jsx';
import { Badge } from '../components/Badge.jsx';
import { CrudPanel } from '../components/CrudPanel.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useResource } from '../hooks/useResource.js';
import { br, formatDate } from '../lib/format.js';

export function Announcements() {
  const resource = useResource('/announcements');
  const [marking, setMarking] = useState(null);

  async function markRead(id) {
    setMarking(id);
    try {
      await api(`/announcements/${id}/read`, { method: 'POST', body: JSON.stringify({}) });
      toast.success('Comunicado marcado como lido.');
      resource.reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setMarking(null);
    }
  }

  return (
    <>
      <PageHeader title="Comunicados" subtitle="Mensagens oficiais, avisos fixados e leitura por público-alvo." />
      <CrudPanel
        title="Novo comunicado"
        endpoint="/announcements"
        onSaved={resource.reload}
        fields={[
          { name: 'title', label: 'Título', required: true },
          { name: 'targetAudience', label: 'Público', type: 'select', options: ['all', 'supervisors', 'specific_units'].map((value) => ({ value, label: br(value) })), required: true },
          { name: 'content', label: 'Conteúdo', type: 'textarea', required: true }
        ]}
      />
      <Filters filters={resource.filters} setFilters={resource.setFilters} />
      <DataTable
        rows={resource.items}
        loading={resource.loading}
        columns={[
          { key: 'title', label: 'Comunicado', render: (row) => <span className="font-semibold">{row.pinned ? 'Fixado · ' : ''}{row.title}</span> },
          { key: 'author', label: 'Autor', render: (row) => row.author?.name || '-' },
          { key: 'targetAudience', label: 'Público', render: (row) => br(row.targetAudience) },
          { key: 'read', label: 'Leitura', render: (row) => row.read ? <Badge value="completed" /> : <button className="btn-secondary" disabled={marking === row.id} onClick={() => markRead(row.id)}>Marcar lido</button> },
          { key: 'createdAt', label: 'Publicado em', render: (row) => formatDate(row.createdAt) }
        ]}
        empty="Nenhum comunicado encontrado."
      />
      <Pagination meta={resource.meta} setFilters={resource.setFilters} />
    </>
  );
}
