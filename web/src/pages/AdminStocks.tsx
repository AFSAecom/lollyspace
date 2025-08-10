import { useProductVariants, importStock, StockVariant } from '../services/stock';
import { useState } from 'react';

export default function AdminStocks() {
  const { data: variants, refetch } = useProductVariants();
  const [loading, setLoading] = useState(false);

  const ruptures = variants?.filter(v => v.stockCurrent === 0) ?? [];
  const low = variants?.filter(v => v.stockCurrent > 0 && v.stockCurrent < v.stockMin) ?? [];
  const ok = variants?.filter(v => v.stockCurrent >= v.stockMin) ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await importStock(form);
      await refetch();
      e.currentTarget.reset();
    } catch (err) {
      alert('Import failed');
    } finally {
      setLoading(false);
    }
  }

  function renderList(title: string, list: StockVariant[]) {
    return (
      <div className="mt-6">
        <h2 className="font-semibold">{title}</h2>
        <ul className="mt-2 flex flex-col gap-1">
          {list.map(v => (
            <li key={v.id}>
              {v.products.inspiredName} {v.size_ml}ml ({v.stockCurrent})
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl">Suivi des stocks</h1>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 max-w-md">
        <label className="flex flex-col">
          Date
          <input type="date" name="date" required className="border p-1" />
        </label>
        <label className="flex flex-col">
          Fournisseur
          <input type="text" name="supplier" required className="border p-1" />
        </label>
        <label className="flex flex-col">
          N° BL
          <input type="text" name="bl_number" required className="border p-1" />
        </label>
        <label className="flex flex-col">
          Fichier Excel
          <input type="file" name="file" accept=".xlsx,.xls" required />
        </label>
        <button type="submit" disabled={loading} className="mt-2 px-4 py-2 bg-primary text-background">
          {loading ? 'Import...' : 'Importer'}
        </button>
      </form>

      {renderList('Ruptures', ruptures)}
      {renderList('Stock minimum', low)}
      {renderList('OK', ok)}
    </div>
  );
}
