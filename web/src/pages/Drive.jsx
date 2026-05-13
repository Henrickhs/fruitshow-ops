import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';
import { api } from '../lib/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { Filters } from '../components/Filters.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { useResource } from '../hooks/useResource.js';
import { formatDate } from '../lib/format.js';

function size(value) {
  if (!value) return '-';
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function Drive() {
  const resource = useResource('/drive/files');
  const fileRef = useRef(null);
  const [folderPath, setFolderPath] = useState('/');
  const [unitId, setUnitId] = useState('');

  async function uploadFile(event) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error('Selecione um arquivo.');
    const form = new FormData();
    form.append('file', file);
    form.append('folderPath', folderPath || '/');
    if (unitId) form.append('unitId', unitId);
    try {
      await api('/drive/files', { method: 'POST', body: form });
      toast.success('Arquivo enviado.');
      fileRef.current.value = '';
      resource.reload();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <>
      <PageHeader title="Disco Virtual" subtitle="Documentos globais e por unidade, com busca, navegação por pasta e download." />
      <form onSubmit={uploadFile} className="surface mb-5 grid gap-3 rounded-lg p-5 md:grid-cols-[1fr_180px_180px_auto]">
        <input ref={fileRef} type="file" className="field h-auto py-2" />
        <input className="field" placeholder="Pasta" value={folderPath} onChange={(event) => setFolderPath(event.target.value)} />
        <input className="field" placeholder="ID da unidade" value={unitId} onChange={(event) => setUnitId(event.target.value)} />
        <button className="btn-primary"><Upload size={17} /> Enviar</button>
      </form>
      <Filters filters={resource.filters} setFilters={resource.setFilters}>
        <input className="field" placeholder="Pasta" value={resource.filters.folderPath || ''} onChange={(event) => resource.setFilters((f) => ({ ...f, folderPath: event.target.value, page: 1 }))} />
      </Filters>
      <DataTable
        rows={resource.items}
        loading={resource.loading}
        columns={[
          { key: 'fileName', label: 'Arquivo' },
          { key: 'folderPath', label: 'Pasta' },
          { key: 'unit', label: 'Unidade', render: (row) => row.unit?.name || 'Global' },
          { key: 'fileSize', label: 'Tamanho', render: (row) => size(row.fileSize) },
          { key: 'uploadedBy', label: 'Enviado por', render: (row) => row.uploadedBy?.name || '-' },
          { key: 'createdAt', label: 'Data', render: (row) => formatDate(row.createdAt) },
          { key: 'download', label: 'Ação', render: (row) => <a className="font-semibold text-acai-700" href={`http://localhost:3333/drive/files/${row.id}/download?token=${localStorage.getItem('fruitshow_token')}`}>Baixar</a> }
        ]}
        empty="Nenhum arquivo encontrado."
      />
      <Pagination meta={resource.meta} setFilters={resource.setFilters} />
    </>
  );
}
