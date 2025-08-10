import { NavLink, Routes, Route } from 'react-router-dom';
import AdvisorCatalog from './AdvisorCatalog';
import AdvisorFavorites from './AdvisorFavorites';
import AdvisorDashboard from './AdvisorDashboard';
import AdvisorHistory from './AdvisorHistory';
import AdvisorCart from './AdvisorCart';
import AdvisorCheckout from './AdvisorCheckout';
import { useCartStore } from '../stores/cart';
import { clearLocalDb } from '../services/localDb';

export default function Advisor() {
  const resetCart = useCartStore((s) => s.reset);
  const handleNewService = async () => {
    resetCart();
    await clearLocalDb();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-2xl">Advisor Area</h1>
        <button
          onClick={handleNewService}
          className="bg-primary text-background px-4 py-2 rounded"
        >
          Nouveau service
        </button>
      </div>
      <nav className="flex gap-4 border-b mb-4">
        <NavLink to="catalogue">Catalogue</NavLink>
        <NavLink to="favoris">Favoris</NavLink>
        <NavLink to="panier">Panier</NavLink>
        <NavLink to="checkout">Checkout</NavLink>
        <NavLink to="tableau">Tableau de bord</NavLink>
        <NavLink to="historique">Historique</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<AdvisorCatalog />} />
        <Route path="catalogue" element={<AdvisorCatalog />} />
        <Route path="favoris" element={<AdvisorFavorites />} />
        <Route path="panier" element={<AdvisorCart />} />
        <Route path="checkout" element={<AdvisorCheckout />} />
        <Route path="tableau" element={<AdvisorDashboard />} />
        <Route path="historique" element={<AdvisorHistory />} />
      </Routes>
    </div>
  );
}
