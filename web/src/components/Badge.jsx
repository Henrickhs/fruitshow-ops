import { br } from '../lib/format.js';

const tone = {
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-600',
  implantation: 'bg-amber-50 text-amber-700',
  critical: 'bg-rose-50 text-rose-700',
  high: 'bg-orange-50 text-orange-700',
  medium: 'bg-sky-50 text-sky-700',
  low: 'bg-slate-100 text-slate-600',
  open: 'bg-rose-50 text-rose-700',
  in_progress: 'bg-blue-50 text-blue-700',
  validation: 'bg-amber-50 text-amber-700',
  concluded: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-emerald-50 text-emerald-700'
};

export function Badge({ value }) {
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-bold ${tone[value] || 'bg-slate-100 text-slate-600'}`}>{br(value)}</span>;
}
