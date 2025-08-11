import { Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Client from './pages/Client';
import Advisor from './pages/Advisor';
import Admin from './pages/Admin';
import AdminProducts from './pages/AdminProducts';
import AdminPromotions from './pages/AdminPromotions';
import AdminStocks from './pages/AdminStocks';
import AdminCommissions from './pages/AdminCommissions';
import AdminCommissionRules from './pages/AdminCommissionRules';

export default function App() {
  const [version, setVersion] = useState<string>();

  useEffect(() => {
    fetch('/version.json')
      .then((res) => res.json())
      .then((data: { version?: string }) => setVersion(data.version))
      .catch(() => {
        /* ignore */
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="p-4 flex gap-4 bg-primary text-background">
        <Link to="/" className="font-serif text-xl">Le Compas Olfactif</Link>
        <Link to="/client">Client</Link>
        <Link to="/advisor">Advisor</Link>
        <Link to="/admin">Admin</Link>
      </nav>
      <main className="p-4 flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/client" element={<Client />} />
          <Route path="/advisor/*" element={<Advisor />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/promotions" element={<AdminPromotions />} />
          <Route path="/admin/stocks" element={<AdminStocks />} />
          <Route path="/admin/commissions" element={<AdminCommissions />} />
          <Route path="/admin/commission-rules" element={<AdminCommissionRules />} />
        </Routes>
      </main>
      <footer className="p-4 text-center text-xs text-neutral-500">{version}</footer>
    </div>
  );
}
