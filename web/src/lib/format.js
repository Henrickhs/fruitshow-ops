import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(value) {
  if (!value) return '-';
  return format(new Date(value), 'dd/MM/yyyy', { locale: ptBR });
}

export const labels = {
  active: 'Ativa',
  inactive: 'Inativa',
  implantation: 'Implantação',
  open: 'Aberto',
  in_progress: 'Em andamento',
  resolved: 'Resolvido',
  closed: 'Fechado',
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
  equipment: 'Equipamentos',
  operational: 'Operacional',
  financial: 'Financeiro',
  other: 'Outro',
  validation: 'Em validação',
  concluded: 'Concluído',
  planning: 'Planejamento',
  on_hold: 'Pausado',
  pending: 'Pendente',
  completed: 'Concluído',
  todo: 'A fazer',
  doing: 'Fazendo',
  done: 'Feito',
  all: 'Todos',
  supervisors: 'Supervisores',
  specific_units: 'Unidades específicas'
};

export function br(value) {
  return labels[value] || value || '-';
}
