import { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { ShoppingBag, AlertTriangle, X, ChevronDown, ChevronUp, Package } from 'lucide-react';

const STATUS_STYLES = {
  pendiente: 'bg-amber-50 text-amber-700 border border-amber-200',
  enviado:   'bg-blue-50 text-blue-700 border border-blue-200',
  entregado: 'bg-green-50 text-green-700 border border-green-200',
  cancelado: 'bg-red-50 text-red-600 border border-red-200',
};

const STATUS_DOT = {
  pendiente: 'bg-amber-400',
  enviado:   'bg-blue-500',
  entregado: 'bg-green-500',
  cancelado: 'bg-red-400',
};

export default function AdminOrders() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const token = localStorage.getItem('token');

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/pedidos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
        return;
      }
      if (!res.ok) throw new Error('Error al cargar pedidos');
      const data = await res.json();
      setPedidos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPedidos(); }, []);

  const cambiarEstado = async (id, estado) => {
    try {
      const res = await fetch(`${API_URL}/api/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado })
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
        return;
      }
      if (!res.ok) throw new Error('Error cambiando estado');
      fetchPedidos();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const stats = {
    total: pedidos.length,
    pendiente: pedidos.filter(p => p.estado === 'pendiente').length,
    enviado: pedidos.filter(p => p.estado === 'enviado').length,
    entregado: pedidos.filter(p => p.estado === 'entregado').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Gestión de pedidos</h2>
        <p className="text-sm text-slate-500 mt-0.5">Actualiza el estado de cada pedido</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Pendientes', value: stats.pendiente, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Enviados', value: stats.enviado, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Entregados', value: stats.entregado, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-32" />
                  <div className="h-5 bg-slate-100 rounded w-24" />
                  <div className="h-3 bg-slate-100 rounded w-40" />
                </div>
                <div className="h-9 w-32 bg-slate-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="w-14 h-14 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No hay pedidos registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map(p => {
            const detalles = p.DetallePedidos || p.DetallePedido || p.detalle || [];
            const isExpanded = expanded[p.id];
            const estado = p.estado || 'pendiente';
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800">Pedido #{p.id}</span>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[estado] || STATUS_STYLES.pendiente}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[estado] || STATUS_DOT.pendiente}`} />
                            {estado.charAt(0).toUpperCase() + estado.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          Usuario #{p.usuarioId} · {new Date(p.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-base font-bold text-blue-600 mt-1">${Number(p.total).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Estado</label>
                        <select
                          value={estado}
                          onChange={(e) => cambiarEstado(p.id, e.target.value)}
                          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregado">Entregado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                      <button
                        onClick={() => toggleExpand(p.id)}
                        className="mt-5 p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
                        title={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && detalles.length > 0 && (
                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                      {detalles.length} {detalles.length === 1 ? 'producto' : 'productos'}
                    </p>
                    <ul className="space-y-2">
                      {detalles.map(d => (
                        <li key={d.id || d.productoId} className="flex items-center justify-between text-sm bg-white rounded-xl px-4 py-2.5 border border-slate-100">
                          <span className="text-slate-700 font-medium truncate pr-3">
                            {(d.Producto && d.Producto.nombre) || d.nombre || `Producto #${d.productoId}`}
                            <span className="text-slate-400 font-normal ml-1">× {d.cantidad}</span>
                          </span>
                          <span className="font-semibold text-slate-800 flex-shrink-0">
                            ${Number((d.precioUnitario || d.precio) * d.cantidad).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
