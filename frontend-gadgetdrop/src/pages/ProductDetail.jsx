import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RecomendacionesWidget from '../components/RecomendacionesWidget';
import { useToast } from '../components/Toast';
import { API_URL } from '../config';
import {
  ShoppingCart, ArrowLeft, AlertTriangle,
  ChevronRight, Minus, Plus, Sparkles,
} from 'lucide-react';

const CAT_COLORS = {
  'Gaming': '#6366f1',
  'Workstation': '#0ea5e9',
  'Creadores de Contenido': '#f59e0b',
  'Accesorios Móviles': '#10b981',
  'Wearables': '#ec4899',
};

function SkeletonBlock({ h = 'h-4', w = 'w-full', rounded = 'rounded-xl' }) {
  return <div className={`${h} ${w} ${rounded} bg-slate-100 animate-pulse`} />;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setProducto(null);
    setCantidad(1);
    fetch(`${API_URL}/api/productos/${id}`)
      .then(async r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setProducto)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const agregarAlCarrito = async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
      addToast({ type: 'info', title: 'Autenticación', message: 'Debes iniciar sesión para agregar al carrito' });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`${API_URL}/api/carrito`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: usuario.id, productoId: producto.id, cantidad }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error');
      addToast({ type: 'success', title: 'Carrito', message: `${producto.nombre} agregado al carrito` });
    } catch {
      addToast({ type: 'error', title: 'Carrito', message: 'Error al agregar al carrito' });
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-2 mb-8">
            <SkeletonBlock h="h-4" w="w-12" />
            <SkeletonBlock h="h-4" w="w-3" />
            <SkeletonBlock h="h-4" w="w-24" />
            <SkeletonBlock h="h-4" w="w-3" />
            <SkeletonBlock h="h-4" w="w-40" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <SkeletonBlock h="h-80" rounded="rounded-2xl" />
            <div className="space-y-4 flex flex-col justify-center">
              <SkeletonBlock h="h-8" w="w-3/4" />
              <SkeletonBlock h="h-10" w="w-1/3" />
              <SkeletonBlock h="h-4" />
              <SkeletonBlock h="h-4" w="w-5/6" />
              <SkeletonBlock h="h-4" w="w-4/6" />
              <SkeletonBlock h="h-5" w="w-1/4" />
              <div className="flex gap-3 pt-2">
                <SkeletonBlock h="h-12" rounded="rounded-xl" />
                <SkeletonBlock h="h-12" w="w-32" rounded="rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (error || !producto) return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <AlertTriangle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Producto no encontrado</h2>
        <p className="text-slate-500 text-sm mb-6">El producto que buscas no existe o fue eliminado.</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>
      </div>
    </>
  );

  const stock = producto.stock ?? 0;
  const catColor = CAT_COLORS[producto.categoria] || '#6b7280';
  const imagenSrc = producto.imagen?.startsWith?.('http')
    ? producto.imagen
    : 'https://placehold.co/600x400?text=Sin+imagen';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-8 flex-wrap">
            <Link to="/" className="hover:text-blue-600 font-medium transition">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{producto.categoria}</span>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-slate-700 font-medium truncate max-w-[200px] sm:max-w-xs">
              {producto.nombre}
            </span>
          </nav>

          {/* Main card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">

            {/* Left — Image */}
            <div>
              <span
                className="inline-block text-xs font-semibold text-white px-3 py-1 rounded-full mb-4"
                style={{ backgroundColor: catColor }}
              >
                {producto.categoria}
              </span>
              <div className="bg-[#f8fafc] rounded-2xl flex items-center justify-center p-8 h-72 sm:h-80">
                <img
                  src={imagenSrc}
                  alt={producto.nombre}
                  className="max-h-64 max-w-full object-contain"
                />
              </div>
            </div>

            {/* Right — Info */}
            <div className="flex flex-col justify-center space-y-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
                {producto.nombre}
              </h1>

              <p className="text-3xl font-bold" style={{ color: '#10b981' }}>
                ${Number(producto.precio).toFixed(2)}
              </p>

              <p className="text-slate-600 text-sm leading-relaxed">
                {producto.descripcion}
              </p>

              {/* Stock badge */}
              <div className="text-sm">
                {stock === 0 ? (
                  <span className="text-red-600 font-semibold">Sin stock disponible</span>
                ) : stock < 5 ? (
                  <span className="text-red-500 font-semibold">
                    ¡Últimas unidades! ({stock} disponibles)
                  </span>
                ) : (
                  <span className="text-slate-500">{stock} unidades disponibles</span>
                )}
              </div>

              {/* Quantity selector */}
              {stock > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">Cantidad:</span>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setCantidad(c => Math.max(1, c - 1))}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-100 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold text-slate-800 min-w-[40px] text-center border-x border-slate-200">
                      {cantidad}
                    </span>
                    <button
                      onClick={() => setCantidad(c => Math.min(stock, c + 1))}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-100 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={agregarAlCarrito}
                  disabled={adding || stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold text-sm transition"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {adding ? 'Agregando...' : 'Añadir al carrito'}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 py-3 px-5 rounded-xl font-medium text-sm transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </button>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">También te puede interesar</h2>
                <p className="text-sm text-slate-500 mt-1">Basado en patrones de compra de otros usuarios</p>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Recomendado por IA
              </span>
            </div>
            <RecomendacionesWidget productoId={Number(id)} />
          </div>

        </div>
      </div>
    </>
  );
}
