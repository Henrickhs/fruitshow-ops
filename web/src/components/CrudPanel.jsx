import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { api } from '../lib/api.js';

export function CrudPanel({ title, fields, endpoint, payload, onSaved, submitLabel = 'Salvar' }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await api(endpoint, { method: 'POST', body: JSON.stringify(payload ? payload(form) : form) });
      toast.success('Registro salvo com sucesso.');
      setForm({});
      setOpen(false);
      onSaved?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={17} /> Novo</button>;
  }

  return (
    <div className="surface mb-5 rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
        <button className="btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
      </div>
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <label key={field.name} className={field.type === 'textarea' ? 'md:col-span-2 xl:col-span-3' : ''}>
            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">{field.label}</span>
            {field.type === 'select' ? (
              <select className="field w-full" value={form[field.name] || ''} onChange={(event) => update(field.name, event.target.value)} required={field.required}>
                <option value="">Selecione</option>
                {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea className="min-h-28 w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-acai-500 focus:ring-2 focus:ring-acai-100" value={form[field.name] || ''} onChange={(event) => update(field.name, event.target.value)} required={field.required} />
            ) : (
              <input className="field w-full" type={field.type || 'text'} value={form[field.name] || ''} onChange={(event) => update(field.name, event.target.value)} required={field.required} />
            )}
          </label>
        ))}
        <div className="md:col-span-2 xl:col-span-3">
          <button className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : submitLabel}</button>
        </div>
      </form>
    </div>
  );
}
