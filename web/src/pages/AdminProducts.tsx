import { useAllProducts, updateProductStatus, Product } from '../services/products';

export default function AdminProducts() {
  const { data: products, refetch } = useAllProducts();

  async function toggle(product: Product) {
    await updateProductStatus(product.id, !product.active);
    refetch();
  }

  const active = products?.filter((p: Product) => p.active) ?? [];
  const inactive = products?.filter((p: Product) => !p.active) ?? [];

  return (
    <div>
      <h1 className="font-serif text-2xl">Gestion des produits</h1>
      <h2 className="mt-4 font-semibold">Actifs</h2>
      <ul className="mt-2 flex flex-col gap-1">
        {active.map((p: Product) => (
          <li key={p.id} className="flex justify-between">
            <span>{p.inspired_name}</span>
            <button onClick={() => toggle(p)} className="text-sm text-red-500">Mettre en veille</button>
          </li>
        ))}
      </ul>
      <h2 className="mt-6 font-semibold">En veille</h2>
      <ul className="mt-2 flex flex-col gap-1">
        {inactive.map((p: Product) => (
          <li key={p.id} className="flex justify-between">
            <span>{p.inspired_name}</span>
            <button onClick={() => toggle(p)} className="text-sm text-green-600">Activer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

