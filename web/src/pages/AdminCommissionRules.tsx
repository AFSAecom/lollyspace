import { useState } from 'react';
import { useCommissionRules, saveCommissionRule, CommissionRule } from '../services/commission_rules';

export default function AdminCommissionRules() {
  const { data: rules, refetch } = useCommissionRules();
  const [form, setForm] = useState<{ id?: number; level: number; rate: number; referrer_id: string }>({
    level: 1,
    rate: 0,
    referrer_id: '',
  });

  function startEdit(r: CommissionRule) {
    setForm({ id: r.id, level: r.level, rate: r.rate, referrer_id: r.referrer_id || '' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await saveCommissionRule({
      id: form.id,
      level: form.level,
      rate: form.rate,
      referrer_id: form.referrer_id || null,
    });
    setForm({ level: 1, rate: 0, referrer_id: '' });
    refetch();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl">Règles de commission</h1>
      <ul className="mt-4 flex flex-col gap-2">
        {rules?.map(r => (
          <li key={r.id} className="flex justify-between">
            <span>
              Niveau {r.level} – {r.rate} – {r.referrer_id ?? 'global'}
            </span>
            <button onClick={() => startEdit(r)} className="text-sm text-blue-600">
              Éditer
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 max-w-sm">
        <input
          type="number"
          value={form.level}
          onChange={e => setForm({ ...form, level: Number(e.target.value) })}
          placeholder="Niveau"
        />
        <input
          type="number"
          step="0.01"
          value={form.rate}
          onChange={e => setForm({ ...form, rate: Number(e.target.value) })}
          placeholder="Taux"
        />
        <input
          type="text"
          value={form.referrer_id}
          onChange={e => setForm({ ...form, referrer_id: e.target.value })}
          placeholder="Referrer ID (optionnel)"
        />
        <button type="submit" className="bg-primary text-background px-2 py-1">
          Sauvegarder
        </button>
      </form>
    </div>
  );
}

