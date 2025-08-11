import { useState } from 'react';
import {
  usePromotions,
  setPromotionActive,
  deletePromotion,
  savePromotion,
} from '../services/promotions';
import { Promotion, PromotionId } from '@/types/promotion';
import {
  PromotionFormValues,
  mapFormToPayload,
} from './adminPromotionsSchema';

function PromotionForm({ promotion, onClose }: { promotion?: Promotion; onClose: () => void }) {
  const [form, setForm] = useState<PromotionFormValues>({
    id: promotion?.id,
    name: promotion?.name || '',
    type: promotion?.type || 'discount',
    combinable: promotion?.combinable ?? true,
    priority: String(promotion?.priority ?? 0),
    startsAt: promotion ? promotion.starts_at.slice(0, 10) : '',
    endsAt: promotion ? promotion.ends_at.slice(0, 10) : '',
    active: promotion?.active ?? true,
    scopeGender: promotion?.scope.genders?.join(',') || '',
    scopeFamily: promotion?.scope.families?.join(',') || '',
    scopeProducts: promotion?.scope.products?.join(',') || '',
    scopeVariants: promotion?.scope.variants?.join(',') || '',
    params: promotion?.items[0]?.params ? JSON.stringify(promotion.items[0].params) : '',
  });

  const handleChange = (field: keyof PromotionFormValues, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = mapFormToPayload(form);
    await savePromotion(payload);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
      <label>
        Nom
        <input
          className="border p-1 ml-2"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
      </label>
      <label>
        Type
        <select
          className="border p-1 ml-2"
          value={form.type}
          onChange={(e) => handleChange('type', e.target.value)}
          disabled={!!promotion}
        >
          <option value="discount">discount</option>
          <option value="two_plus_one">2+1</option>
          <option value="pack">pack</option>
        </select>
      </label>
      <label>
        Combinable
        <input
          type="checkbox"
          className="ml-2"
          checked={form.combinable}
          onChange={(e) => handleChange('combinable', e.target.checked)}
        />
      </label>
      <label>
        Priority
        <input
          type="number"
          className="border p-1 ml-2"
          value={form.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
          required
        />
      </label>
      <label>
        Début
        <input
          type="date"
          className="border p-1 ml-2"
          value={form.startsAt}
          onChange={(e) => handleChange('startsAt', e.target.value)}
          required
        />
      </label>
      <label>
        Fin
        <input
          type="date"
          className="border p-1 ml-2"
          value={form.endsAt}
          onChange={(e) => handleChange('endsAt', e.target.value)}
          required
        />
      </label>
      <label>
        Actif
        <input
          type="checkbox"
          className="ml-2"
          checked={form.active}
          onChange={(e) => handleChange('active', e.target.checked)}
        />
      </label>
      <label>
        Scope gender
        <input
          className="border p-1 ml-2"
          value={form.scopeGender}
          onChange={(e) => handleChange('scopeGender', e.target.value)}
        />
      </label>
      <label>
        Scope family
        <input
          className="border p-1 ml-2"
          value={form.scopeFamily}
          onChange={(e) => handleChange('scopeFamily', e.target.value)}
        />
      </label>
      <label>
        Scope products
        <input
          className="border p-1 ml-2"
          value={form.scopeProducts}
          onChange={(e) => handleChange('scopeProducts', e.target.value)}
        />
      </label>
      <label>
        Scope variants
        <input
          className="border p-1 ml-2"
          value={form.scopeVariants}
          onChange={(e) => handleChange('scopeVariants', e.target.value)}
        />
      </label>
      <label>
        Params JSON
        <textarea
          className="border p-1 ml-2"
          value={form.params}
          onChange={(e) => handleChange('params', e.target.value)}
        />
      </label>
      <div className="flex gap-2">
        <button type="submit" className="px-2 py-1 bg-primary text-background">
          Enregistrer
        </button>
        <button type="button" onClick={onClose} className="px-2 py-1 border">
          Annuler
        </button>
      </div>
    </form>
  );
}

export default function AdminPromotions() {
  const { data: promotions, refetch } = usePromotions();
  const [editing, setEditing] = useState<Promotion | null | undefined>(undefined);

  const handleEdit = (id: PromotionId) => {
    const promo = promotions?.find((p) => p.id === id);
    setEditing(promo ?? null);
  };

  const handleDelete = async (id: PromotionId) => {
    await deletePromotion(id);
    refetch();
  };

  const handleToggle = async (id: PromotionId, nextActive: boolean) => {
    await setPromotionActive(id, nextActive);
    refetch();
  };

  const handleDuplicate = async (p: Promotion) => {
    const copy = { ...p, id: undefined, name: `${p.name} (copy)`, active: false };
    await savePromotion(copy);
    refetch();
  };

  return (
    <div>
      <h1 className="font-serif text-2xl">Gestion des promotions</h1>
      {editing !== undefined && (
        <PromotionForm
          promotion={editing || undefined}
          onClose={() => {
            setEditing(undefined);
            refetch();
          }}
        />
      )}
      {editing === undefined && (
        <button
          onClick={() => setEditing(null)}
          className="mt-4 px-2 py-1 bg-primary text-background"
        >
          Nouvelle promotion
        </button>
      )}
      <ul className="mt-4 flex flex-col gap-1">
        {promotions?.map((p) => (
          <li key={p.id} className="flex justify-between">
            <span>{p.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleToggle(p.id, !p.active)}
                className="text-sm text-primary"
              >
                {p.active ? 'Désactiver' : 'Activer'}
              </button>
              <button
                onClick={() => handleEdit(p.id)}
                className="text-sm text-primary"
              >
                Éditer
              </button>
              <button
                onClick={() => handleDuplicate(p)}
                className="text-sm text-primary"
              >
                Dupliquer
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-sm text-primary"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
