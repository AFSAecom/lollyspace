import { Link, Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen">
      <nav className="bg-primary text-white p-4 flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/client">Client</Link>
        <Link to="/advisor">Advisor</Link>
        <Link to="/admin">Admin</Link>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
