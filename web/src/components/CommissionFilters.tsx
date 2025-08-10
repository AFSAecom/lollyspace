import { Advisor, useAdvisors } from '../services/advisors';

export interface CommissionFilterValues {
  from?: string;
  to?: string;
  referrerId?: string;
}

export default function CommissionFilters({ value, onChange }: { value: CommissionFilterValues; onChange: (v: CommissionFilterValues) => void }) {
  const { data: advisors } = useAdvisors();

  function handleChange(partial: Partial<CommissionFilterValues>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="flex gap-4 items-end">
      <div>
        <label className="block text-sm">Du</label>
        <input type="date" value={value.from ?? ''} onChange={e => handleChange({ from: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm">Au</label>
        <input type="date" value={value.to ?? ''} onChange={e => handleChange({ to: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm">Conseiller</label>
        <select value={value.referrerId ?? ''} onChange={e => handleChange({ referrerId: e.target.value || undefined })}>
          <option value="">Tous</option>
          {advisors?.map((a: Advisor) => (
            <option key={a.id} value={a.id}>
              {a.first_name} {a.last_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
