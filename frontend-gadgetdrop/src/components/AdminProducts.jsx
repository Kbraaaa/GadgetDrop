import { useEffect, useState } from 'react';
import ProductForm from './ProductForm';
import { API_URL } from '../config';
import { Search, Plus, X, Package, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminProducts() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const token = localStorage.getItem('token');

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/productos`);
      const data = await res.json();
      setProductos(data || []);
    } catch {
      setError('No se pudo cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProductos(); }, []);

  const handleCreate = async (payload) => {
    try {
      const res = await fetch(`${API_URL}/api/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || body.message || body.mensaje || 'Error al crear');
      setShowCreateForm(false);
      fetchProductos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      const res = await fetch(`${API_URL}/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || body.message || body.mensaje || 'Error al actualizar');
      setEditing(null);
      fetchProductos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      const res = await fetch(`${API_URL}/api/productos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al eliminar');
      fetchProductos();
    } catch (err) {
      setError(err.message);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? productos.filter(p => (p.nombre || '').toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q))
    : productos.slice();
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Catálogo de productos</h2>
          <p className="text-sm text-slate-500 mt-0.5">{productos.length} productos en total</p>
        </div>
        <button
          onClick={() => { setShowCreateForm(true); setEditing(null); }}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm shadow-blue-200 transition text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowCreateForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">Nuevo producto</h3>
              <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProductForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Editar producto</h3>
                <p className="text-sm text-slate-400">ID #{editing.id}</p>
              </div>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProductForm initial={editing} onSubmit={(vals) => handleUpdate(editing.id, vals)} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition bg-white"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={pageSize}
          onChange={e => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none bg-white"
        >
          <option value={6}>6 por página</option>
          <option value={9}>9 por página</option>
          <option value={12}>12 por página</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
              <div className="h-44 bg-slate-100" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-8 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="w-14 h-14 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No se encontraron productos</p>
          {search && <p className="text-slate-400 text-sm mt-1">Intenta con otro término de búsqueda</p>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pageItems.map(p => {
              const lowStock = p.stock !== null && p.stock !== undefined && p.stock < 5;
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="h-44 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative overflow-hidden">
                    {p.imagen ? (
                      <img src={p.imagen} alt={p.nombre} className="h-36 object-contain group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Package className="w-12 h-12 text-slate-300" />
                    )}
                    {lowStock && (
                      <span className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                        Stock bajo
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-slate-800 truncate text-sm">{p.nombre}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{p.descripcion || 'Sin descripción'}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <div className="text-blue-600 font-bold text-base">${Number(p.precio).toFixed(2)}</div>
                        <div className="text-xs text-slate-400">
                          Stock: <span className={`font-semibold ${lowStock ? 'text-amber-600' : 'text-slate-600'}`}>{p.stock ?? 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditing(p); setShowCreateForm(false); }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg text-xs font-medium transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-lg text-xs font-medium transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-sm text-slate-500">
              Mostrando <span className="font-medium text-slate-700">{start + 1}–{Math.min(start + pageSize, total)}</span> de <span className="font-medium text-slate-700">{total}</span> resultados
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Primera
              </button>
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Última
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
