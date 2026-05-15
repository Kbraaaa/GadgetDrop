import { useEffect, useState } from 'react';
import { Package, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';

const STATUS_STYLES = {
  pagado:    'bg-green-100 text-green-700 border-green-200',
  pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
  enviado:   'bg-blue-100 text-blue-700 border-blue-200',
  entregado: 'bg-green-100 text-green-700 border-green-200',
  cancelado: 'bg-red-100 text-red-600 border-red-200',
};

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const usuario = JSON.parse(localStorage.getItem('usuario')) || {};

  useEffect(() => {
    async function cargarPedidos() {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/api/pedidos/usuario/${usuario.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        setPedidos(res.ok && Array.isArray(data) ? data : []);
      } catch {
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    }

    if (usuario?.id) cargarPedidos();
    else setLoading(false);
  }, [usuario.id]);

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
            <Package className="w-7 h-7 text-blue-600" />
            Mis Pedidos
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-48 text-slate-500">
              <Loader2 className="animate-spin w-6 h-6 mr-2" />
              Cargando pedidos...
            </div>
          ) : pedidos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No tienes pedidos aún</h3>
              <p className="text-slate-400 text-sm">Realiza tu primera compra para verla aquí</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidos.map(p => {
                const isExpanded = expanded[p.id];
                const estado = p.estado || 'pendiente';
                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-800">Pedido #{p.id}</h3>
                            <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[estado] || STATUS_STYLES.pendiente}`}>
                              {estado.charAt(0).toUpperCase() + estado.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            {new Date(p.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-lg font-bold text-blue-600 mt-1.5">
                            ${Number(p.total).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleExpand(p.id)}
                          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition flex-shrink-0"
                        >
                          {isExpanded ? (
                            <><ChevronUp className="w-4 h-4" />Ocultar</>
                          ) : (
                            <><ChevronDown className="w-4 h-4" />Ver detalles</>
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                          {p.DetallePedidos?.length || 0} productos
                        </p>
                        <ul className="space-y-2">
                          {(p.DetallePedidos || []).map(dp => (
                            <li key={dp.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-100 text-sm">
                              <span className="text-slate-700 font-medium truncate pr-3">
                                {dp.Producto?.nombre || `Producto #${dp.productoId}`}
                                <span className="text-slate-400 font-normal ml-1">× {dp.cantidad}</span>
                              </span>
                              <span className="font-semibold text-slate-800 flex-shrink-0">
                                ${(dp.precioUnitario * dp.cantidad).toFixed(2)}
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
      </div>
    </>
  );
}
