import React, { useEffect, useState } from 'react';

export default function AdminOrders() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/pedidos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No autorizado o error');
      const data = await res.json();
      setPedidos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const cambiarEstado = async (id, estado) => {
    try {
      const res = await fetch(`http://localhost:5000/api/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado })
      });
      if (!res.ok) throw new Error('Error cambiando estado');
      await res.json();
      fetchPedidos();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-slate-800">Gestión de pedidos</h2>
        <div className="text-sm text-slate-500">Total pedidos: <span className="font-medium text-slate-800">{pedidos.length}</span></div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="py-10 text-center text-slate-600">Cargando pedidos…</div>
      ) : (
        <div className="space-y-4">
          {pedidos.length === 0 && <div className="text-center py-8 text-slate-500">No hay pedidos.</div>}
          {pedidos.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm p-4 border">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-500">Pedido #{p.id} • Usuario: <span className="font-medium text-slate-700">{p.usuarioId}</span></div>
                  <div className="text-lg font-semibold text-slate-800">Total: <span className="text-blue-600">${Number(p.total).toFixed(2)}</span></div>
                  <div className="text-sm text-slate-500">Fecha: {new Date(p.createdAt).toLocaleString()}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Estado</label>
                    <select value={p.estado || 'pendiente'} onChange={(e) => cambiarEstado(p.id, e.target.value)} className="border rounded px-3 py-2 text-sm">
                      <option value="pendiente">pendiente</option>
                      <option value="enviado">enviado</option>
                      <option value="entregado">entregado</option>
                      <option value="cancelado">cancelado</option>
                    </select>
                  </div>
                  <div className="text-sm text-slate-500">Items: <span className="font-medium text-slate-700">{(p.DetallePedidos || p.DetallePedido || p.detalle || []).length}</span></div>
                </div>
              </div>

              <div className="mt-3 border-t pt-3">
                <ul className="space-y-2">
                  {(p.DetallePedidos || p.DetallePedido || p.detalle || []).map(d => (
                    <li key={d.id || d.productoId} className="flex justify-between text-sm text-slate-700">
                      <div className="truncate pr-2">{(d.Producto && d.Producto.nombre) || d.nombre || `Producto ${d.productoId}`} × {d.cantidad}</div>
                      <div className="font-medium">${Number((d.precioUnitario || d.precio) * d.cantidad).toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
