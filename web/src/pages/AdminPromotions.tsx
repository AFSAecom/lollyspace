import { usePromotions, updatePromotion, Promotion } from '../services/promotions';

export default function AdminPromotions() {
  const { data: promotions, refetch } = usePromotions();

  async function toggle(promo: Promotion) {
    await updatePromotion(promo.id, !promo.active);
    refetch();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl">Gestion des promotions</h1>
      <ul className="mt-4 flex flex-col gap-1">
        {promotions?.map(p => (
          <li key={p.id} className="flex justify-between">
            <span>{p.type}</span>
            <button onClick={() => toggle(p)} className="text-sm text-primary">
              {p.active ? 'Désactiver' : 'Activer'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

