import {
  usePromotions,
  updatePromotion,
  deletePromotion,
  savePromotion,
  PromotionInput,
} from '../services/promotions';
import { Promotion, PromotionId } from '@/types/promotion';
import { useState } from 'react';

type PromotionWithApi = Promotion & {
  condition_json?: any;
  starts_at: string;
  ends_at: string;
};

function PromotionForm({
  promotion,
  onClose,
}: {
  promotion?: PromotionWithApi;
  onClose: () => void;
}) {
  const [type, setType] = useState<PromotionInput['type']>(
    promotion?.type || 'discount',
  );
  const [productVariantId, setProductVariantId] = useState(
    promotion?.condition_json?.product_variant_id || '',
  );
  const [percent, setPercent] = useState(
    promotion?.condition_json?.percent || '',
  );
  const [packIds, setPackIds] = useState(
    promotion?.condition_json?.product_variant_ids?.join(',') || '',
  );
  const [packPrice, setPackPrice] = useState(
    promotion?.condition_json?.price || '',
  );
  const [startsAt, setStartsAt] = useState(
    promotion ? promotion.starts_at.slice(0, 10) : '',
  );
  const [endsAt, setEndsAt] = useState(
    promotion ? promotion.ends_at.slice(0, 10) : '',
  );
  const [active, setActive] = useState(promotion?.active ?? true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let condition_json: any;
    if (type === 'discount') {
      condition_json = {
        product_variant_id: Number(productVariantId),
        percent: Number(percent),
      };
    } else if (type === 'two_plus_one') {
      condition_json = { product_variant_id: Number(productVariantId) };
    } else {
      condition_json = {
        product_variant_ids: packIds
          .split(',')
          .map((id: string) => Number(id.trim()))
          .filter(Boolean),
        price: Number(packPrice),
      };
    }
    await savePromotion({
      id: promotion?.id,
      type,
      condition_json,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      active,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
      <label>
        Type
        <select
          value={type}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setType(e.target.value as PromotionInput['type'])
          }
          className="border p-1 ml-2"
          disabled={!!promotion}
        >
          <option value="discount">discount</option>
          <option value="two_plus_one">2+1</option>
          <option value="pack">pack</option>
        </select>
      </label>
      {(type === 'discount' || type === 'two_plus_one') && (
        <label>
          Variant ID
          <input
            type="number"
            value={productVariantId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setProductVariantId(e.target.value)
            }
            className="border p-1 ml-2"
            required
          />
        </label>
      )}
      {type === 'discount' && (
        <label>
          Percent
          <input
            type="number"
            value={percent}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPercent(e.target.value)
            }
            className="border p-1 ml-2"
            required
          />
        </label>
      )}
      {type === 'pack' && (
        <>
          <label>
            Variant IDs (comma)
            <input
              type="text"
              value={packIds}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPackIds(e.target.value)
              }
              className="border p-1 ml-2"
              required
            />
          </label>
          <label>
            Pack price
            <input
              type="number"
              value={packPrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPackPrice(e.target.value)
              }
              className="border p-1 ml-2"
              required
            />
          </label>
        </>
      )}
      <label>
        Début
        <input
          type="date"
          value={startsAt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setStartsAt(e.target.value)
          }
          className="border p-1 ml-2"
          required
        />
      </label>
      <label>
        Fin
        <input
          type="date"
          value={endsAt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEndsAt(e.target.value)
          }
          className="border p-1 ml-2"
          required
        />
      </label>
      <label>
        Actif
        <input
          type="checkbox"
          checked={active}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setActive(e.target.checked)
          }
          className="ml-2"
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
  const [editing, setEditing] = useState<PromotionWithApi | null | undefined>(
    undefined,
  );

  const handleEdit = (id: PromotionId) => {
    const promo = (promotions as PromotionWithApi[] | undefined)?.find(
      (p: PromotionWithApi) => p.id === id,
    );
    setEditing(promo ?? null);
  };

  const handleDelete = async (id: PromotionId) => {
    await deletePromotion(id);
    refetch();
  };

  const handleToggle = async (id: PromotionId, nextActive: boolean) => {
    await updatePromotion(id, nextActive);
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
        {(promotions as PromotionWithApi[] | undefined)?.map(
          (p: PromotionWithApi) => (
          <li key={p.id} className="flex justify-between">
            <span>{p.type}</span>
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

