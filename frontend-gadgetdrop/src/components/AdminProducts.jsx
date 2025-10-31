import React, { useEffect, useState } from 'react';
import ProductForm from './ProductForm';

export default function AdminProducts() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const token = localStorage.getItem('token');

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/productos');
      const data = await res.json();
      setProductos(data || []);
    } catch (err) {
      setError('No se pudo cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleCreate = async (payload) => {
    try {
      const res = await fetch('http://localhost:5000/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        const msg = body && (body.error || body.message || body.mensaje) ? (body.error || body.message || body.mensaje) : 'Error al crear';
        throw new Error(msg);
      }
      fetchProductos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      const res = await fetch(`http://localhost:5000/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        const msg = body && (body.error || body.message || body.mensaje) ? (body.error || body.message || body.mensaje) : 'Error al actualizar';
        throw new Error(msg);
      }
      setEditing(null);
      fetchProductos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/productos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al eliminar');
      fetchProductos();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Gestión de productos</h2>
          <p className="text-sm text-slate-500">Crea, edita y elimina productos. Los cambios se aplican en tiempo real.</p>
        </div>
        <div className="w-full md:w-80">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-3">Nuevo producto</h3>
            <ProductForm onSubmit={handleCreate} />
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:w-64 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-200"
          />
          <select value={pageSize} onChange={e => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }} className="px-2 py-2 border rounded">
            <option value={6}>6 / página</option>
            <option value={9}>9 / página</option>
            <option value={12}>12 / página</option>
          </select>
        </div>
        <div className="text-sm text-slate-500">Mostrando {productos.length} productos</div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-600">Cargando productos…</div>
      ) : (
        (() => {
          const q = search.trim().toLowerCase();
          const filtered = q ? productos.filter(p => (p.nombre || '').toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q)) : productos.slice();
          const total = filtered.length;
          const totalPages = Math.max(1, Math.ceil(total / pageSize));
          const currentPage = Math.min(page, totalPages);
          const start = (currentPage - 1) * pageSize;
          const pageItems = filtered.slice(start, start + pageSize);

          return (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageItems.map(p => (
                  <div key={p.id} className="bg-white rounded-lg shadow-sm overflow-hidden border">
                    <div className="h-40 bg-gray-50 flex items-center justify-center">
                      {p.imagen ? (
                        // eslint-disable-next-line jsx-a11y/img-redundant-alt
                        <img src={p.imagen} alt={`Imagen de ${p.nombre}`} className="h-36 object-contain" />
                      ) : (
                        <div className="text-slate-400">Sin imagen</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-800 mb-1 truncate">{p.nombre}</h4>
                      <p className="text-sm text-slate-500 mb-2 truncate">{p.descripcion}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-blue-600 font-bold">${Number(p.precio).toFixed(2)}</div>
                          <div className="text-sm text-slate-500">Stock: <span className="font-medium text-slate-700">{p.stock ?? 0}</span></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditing(p)} className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded-md shadow">Editar</button>
                          <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow">Eliminar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>


              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-600">Mostrando {start + 1}–{Math.min(start + pageSize, total)} de {total} resultados</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(1)} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Primera</button>
                  <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Anterior</button>
                  <div className="px-3 py-1 text-sm">Página {currentPage} / {totalPages}</div>
                  <button onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Siguiente</button>
                  <button onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Última</button>
                </div>
              </div>
            </>
          );
        })()
      )}

      {editing && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Editar producto #{editing.id}</h3>
          <ProductForm initial={editing} onSubmit={(vals) => handleUpdate(editing.id, vals)} onCancel={() => setEditing(null)} />
        </div>
      )}
    </div>
  );
}
