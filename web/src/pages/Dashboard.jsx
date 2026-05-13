import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, Building2, CheckSquare, ClipboardList, FolderOpen, Megaphone, Rocket, Ticket } from 'lucide-react';
import { api } from '../lib/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { br } from '../lib/format.js';

function Card({ icon: Icon, label, value, detail, tone = 'text-acai-700' }) {
  return (
    <div className="surface rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-600">{label}</p>
        <Icon className={tone} size={21} />
      </div>
      <p className="text-3xl font-black text-slate-950">{value ?? '-'}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

export function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/dashboard')
      .then(setData)
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  const statusText = data?.units?.byStatus?.map((item) => `${br(item.status)}: ${item._count}`).join(' · ') || 'Sem unidades';
  const priorityText = data?.tickets?.byPriority?.map((item) => `${br(item.priority)}: ${item._count}`).join(' · ') || 'Sem chamados';

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Indicadores de campo, pendências críticas e sinais de operação por módulo." />
      {loading ? (
        <div className="surface rounded-lg p-8 text-sm text-slate-500">Carregando indicadores...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card icon={Building2} label="Unidades" value={data.units.total} detail={statusText} />
          <Card icon={Ticket} label="Chamados abertos" value={data.tickets.open} detail={priorityText} tone="text-pitaya" />
          <Card icon={CheckSquare} label="Avaliações" value={data.checklist.totalEvaluations} detail={`${data.checklist.inValidation} em validação`} tone="text-folha" />
          <Card icon={AlertTriangle} label="Planos de ação" value={data.checklist.actionPlans} detail="Tarefas em aberto nos projetos" tone="text-sol" />
          <Card icon={Megaphone} label="Comunicados não lidos" value={data.announcements.unread} detail="Mensagens pendentes" />
          <Card icon={Rocket} label="Implantações ativas" value={data.onboarding.active} detail="Unidades em abertura" tone="text-folha" />
          <Card icon={ClipboardList} label="Projetos ativos" value={data.checklist.actionPlans} detail="Tarefas a fazer ou fazendo" />
          <Card icon={FolderOpen} label="Arquivos" value={data.drive.files} detail="Documentos globais e por unidade" tone="text-pitaya" />
        </div>
      )}
    </>
  );
}
