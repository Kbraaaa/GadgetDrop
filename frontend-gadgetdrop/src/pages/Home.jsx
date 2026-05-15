import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';
import { API_URL } from '../config';
import { ShoppingCart, Zap, Package, Star } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetch(`${API_URL}/api/productos`)
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setProductos(data);
        else throw new Error('Respuesta no válida del servidor');
      })
      .catch(err => {
        console.error('Error al obtener productos:', err);
        setError(err.message || 'No se pudieron cargar los productos');
      })
      .finally(() => setLoading(false));
  }, []);

  const agregarAlCarrito = async producto => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
      addToast({ type: 'info', title: 'Autenticación', message: 'Debes iniciar sesión para agregar al carrito' });
      return;
    }
    setAddingId(producto.id);
    try {
      const res = await fetch(`${API_URL}/api/carrito`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: usuario.id, productoId: producto.id, cantidad: 1 }),
      });
      const resultado = await res.json();
      if (!res.ok) throw new Error(resultado.error || 'Error al agregar al carrito');
      addToast({ type: 'success', title: 'Carrito', message: `${producto.nombre} agregado al carrito` });
    } catch (err) {
      addToast({ type: 'error', title: 'Carrito', message: 'Error al agregar al carrito' });
    } finally {
      setAddingId(null);
    }
  };

  return (
    <>
      <Navbar />

      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            Lo último en tecnología
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 tracking-tight">
            Encuentra los gadgets<br />
            <span className="text-yellow-400">más innovadores</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Explora nuestra selección de productos tecnológicos y descubre lo último en innovación.
          </p>
        </div>
      </header>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Productos destacados</h2>
            {!loading && !error && (
              <p className="text-sm text-slate-500 mt-1">{productos.length} productos disponibles</p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="h-9 bg-slate-100 rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : productos.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="w-16 h-16 text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map(prod => (
              <div
                key={prod.id}
                onClick={() => navigate(`/producto/${prod.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group cursor-pointer"
              >
                <div className="h-48 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={prod?.imagen?.startsWith?.('http') ? prod.imagen : 'https://placehold.co/300x200?text=Sin+imagen'}
                    alt={prod?.nombre || 'Producto'}
                    className="h-40 object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">{prod.nombre}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 flex-1">{prod.descripcion}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xl font-bold text-slate-800">${Number(prod.precio).toFixed(2)}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); agregarAlCarrito(prod); }}
                    disabled={addingId === prod.id}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-xl font-medium text-sm transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {addingId === prod.id ? 'Agregando...' : 'Añadir al carrito'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
