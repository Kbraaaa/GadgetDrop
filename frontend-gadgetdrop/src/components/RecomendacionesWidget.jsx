import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { Loader2, AlertCircle } from 'lucide-react';

const CAT_COLORS = {
  'Gaming': '#6366f1',
  'Workstation': '#0ea5e9',
  'Creadores de Contenido': '#f59e0b',
  'Accesorios Móviles': '#10b981',
  'Wearables': '#ec4899',
};

export default function RecomendacionesWidget({ productoId }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productoId) return;
    const token = localStorage.getItem('token');
    setLoading(true);
    setError(null);
    setData(null);

    fetch(`${API_URL}/api/recomendaciones/${productoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async r => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Error al cargar recomendaciones');
        return d;
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [productoId]);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-2" />
      <span className="text-slate-500 text-sm">Calculando recomendaciones...</span>
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      {error}
    </div>
  );

  if (!data) return null;

  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">
        Recomendaciones para{' '}
        <span className="font-semibold text-slate-700">{data.nombreProducto}</span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.recomendaciones.map(rec => {
          const color = CAT_COLORS[rec.categoria] || '#6b7280';
          return (
            <div
              key={rec.productoId}
              onClick={() => navigate(`/producto/${rec.productoId}`)}
              className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col gap-3 cursor-pointer shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-150"
            >
              <div>
                <p className="text-sm font-bold text-slate-800 leading-snug">{rec.nombre}</p>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: color }}
                  >
                    {rec.categoria}
                  </span>
                  <p className="text-sm font-bold text-slate-700">
                    ${rec.precio.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Relevancia</span>
                  <span className="font-semibold" style={{ color }}>
                    {(rec.similitud * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${rec.similitud * 100}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
