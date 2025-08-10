import { useState } from 'react';
import {
  useCommissionSettings,
  saveCommissionSetting,
  CommissionSetting,
} from '../services/commission_settings';

export default function AdminCommissionRules() {
  const { data: settings, refetch } = useCommissionSettings();
  const [form, setForm] = useState<CommissionSetting>({
    level: 1,
    rate: 0,
    active: true,
  });

  function startEdit(s: CommissionSetting) {
    setForm({ level: s.level, rate: s.rate, active: s.active });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await saveCommissionSetting(form);
    setForm({ level: 1, rate: 0, active: true });
    refetch();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl">Paramètres de commission</h1>
      <ul className="mt-4 flex flex-col gap-2">
        {settings?.map((s) => (
          <li key={s.level} className="flex justify-between">
            <span>
              Niveau {s.level} – {s.rate} – {s.active ? 'actif' : 'inactif'}
            </span>
            <button
              onClick={() => startEdit(s)}
              className="text-sm text-blue-600"
            >
              Éditer
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-2 max-w-sm"
      >
        <input
          type="number"
          value={form.level}
          onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
          placeholder="Niveau"
        />
        <input
          type="number"
          step="0.01"
          value={form.rate}
          onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })}
          placeholder="Taux"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Actif
        </label>
        <button
          type="submit"
          className="bg-primary text-background px-2 py-1"
        >
          Sauvegarder
        </button>
      </form>
    </div>
  );
}
