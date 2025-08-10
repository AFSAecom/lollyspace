import { Link } from 'react-router-dom';
import { useOrders } from '../services/admin';
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export default function Admin() {
  const { data: orders } = useOrders();

  const chartData = useMemo(() => {
    if (!orders) return [] as { date: string; revenue: number; sales: number }[];
    const map = new Map<string, { date: string; revenue: number; sales: number }>();
    for (const o of orders) {
      const date = o.created_at.slice(0, 10);
      const item = map.get(date) || { date, revenue: 0, sales: 0 };
      item.revenue += Number(o.total_tnd);
      item.sales += 1;
      map.set(date, item);
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [orders]);

  async function exportXlsx() {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export_sales_xlsx`,
      {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      },
    );
    if (!res.ok) {
      alert('Export failed');
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="font-serif text-2xl">Admin Area</h1>
      <nav className="mt-4 flex gap-4">
        <Link to="/admin/products">Produits</Link>
        <Link to="/admin/promotions">Promotions</Link>
        <Link to="/admin/stocks">Stocks</Link>
        <Link to="/admin/commissions">Commissions</Link>
        <Link to="/admin/commission-rules">Règles de commissions</Link>
      </nav>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-center mt-2">Chiffre d'affaires</p>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-center mt-2">Nombre de ventes</p>
        </div>
      </div>
      <button
        onClick={exportXlsx}
        className="mt-8 px-4 py-2 bg-primary text-background"
      >
        Export .xlsx
      </button>
    </div>
  );
}

