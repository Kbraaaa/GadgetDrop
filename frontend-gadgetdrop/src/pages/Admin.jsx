import React, { useEffect, useState } from 'react';
import AdminProducts from '../components/AdminProducts';
import AdminOrders from '../components/AdminOrders';

export default function Admin() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const [tab, setTab] = useState('productos');

  if (!usuario) return <div className="p-6">Acceso denegado. Inicia sesión.</div>;
  if (usuario.rol !== 'admin') return <div className="p-6">Acceso denegado: solo administradores.</div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800">Panel de administración</h1>
        <p className="text-sm text-slate-500 mt-1">Gestiona productos y pedidos desde esta consola.</p>
      </header>

      <nav className="flex items-center gap-3 mb-8">
        <button
          onClick={() => setTab('productos')}
          className={`px-4 py-2 rounded-md font-medium transition ${tab === 'productos' ? 'bg-blue-600 text-white shadow' : 'bg-white border text-slate-700'}`}>
          Productos
        </button>
        <button
          onClick={() => setTab('pedidos')}
          className={`px-4 py-2 rounded-md font-medium transition ${tab === 'pedidos' ? 'bg-blue-600 text-white shadow' : 'bg-white border text-slate-700'}`}>
          Pedidos
        </button>
      </nav>

      <main>
        {tab === 'productos' && <AdminProducts />}
        {tab === 'pedidos' && <AdminOrders />}
      </main>
    </div>
  );
}
