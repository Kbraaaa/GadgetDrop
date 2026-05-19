import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminProducts from '../components/AdminProducts';
import AdminOrders from '../components/AdminOrders';
import AdminSupport from '../components/AdminSupport';
import { Package, ShoppingBag, MessageSquare, ArrowLeft, Menu, X, ChevronRight, Shield } from 'lucide-react';

const tabs = [
  { id: 'productos', label: 'Productos', icon: Package, desc: 'Gestionar catálogo' },
  { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag, desc: 'Ver y actualizar' },
  { id: 'soporte', label: 'Soporte', icon: MessageSquare, desc: 'Tickets de clientes' },
];

export default function Admin() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const [tab, setTab] = useState('productos');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!usuario) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-2xl shadow-md text-center max-w-sm w-full">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-slate-700 font-semibold text-lg mb-2">Acceso denegado</p>
        <p className="text-slate-500 text-sm mb-6">Necesitas iniciar sesión para continuar.</p>
        <Link to="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition">Iniciar sesión</Link>
      </div>
    </div>
  );

  if (usuario.rol !== 'admin') return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-2xl shadow-md text-center max-w-sm w-full">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-slate-700 font-semibold text-lg mb-2">Sin permisos</p>
        <p className="text-slate-500 text-sm mb-6">Solo los administradores pueden acceder a este panel.</p>
        <Link to="/" className="inline-block bg-slate-700 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium transition">Volver al inicio</Link>
      </div>
    </div>
  );

  const activeTab = tabs.find(t => t.id === tab);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex`}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
          <Link to="/" className="text-yellow-400 font-extrabold text-xl tracking-wide">
            GadgetDrop
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow">
              {(usuario.nombre || 'A')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{usuario.nombre || 'Admin'}</p>
              <span className="inline-flex items-center gap-1 text-xs text-indigo-300 bg-indigo-900/50 px-2 py-0.5 rounded-full">
                <Shield className="w-3 h-3" /> Admin
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group
                  ${active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className={`text-xs truncate ${active ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-300'}`}>{t.desc}</div>
                </div>
                {active && <ChevronRight className="w-4 h-4 text-blue-200 flex-shrink-0" />}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-700/60">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors px-2 py-2 rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al sitio
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-gray-100 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            {activeTab && React.createElement(activeTab.icon, { className: 'w-5 h-5 text-blue-600 flex-shrink-0' })}
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-slate-800 leading-tight">{activeTab?.label}</h1>
              <p className="text-xs text-slate-400 hidden sm:block">{activeTab?.desc}</p>
            </div>
          </div>

          <div className="ml-auto text-xs text-slate-400 hidden md:block">
            Panel de administración · GadgetDrop
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {tab === 'productos' && <AdminProducts />}
          {tab === 'pedidos' && <AdminOrders />}
          {tab === 'soporte' && <AdminSupport />}
        </main>
      </div>
    </div>
  );
}
