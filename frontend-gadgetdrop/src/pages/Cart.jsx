import { useEffect, useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Package, CreditCard } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';
import { API_URL } from '../config';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
  const token = localStorage.getItem('token');
  const { addToast } = useToast();

  const fetchCarrito = async () => {
    try {
      const res = await fetch(`${API_URL}/api/carrito/${usuario.id}`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCarrito(); }, [usuario.id]);

  const actualizarCantidad = async (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    try {
      const res = await fetch(`${API_URL}/api/carrito/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cantidad: nuevaCantidad }),
      });
      if (res.ok) fetchCarrito();
    } catch (err) {
      console.error(err);
    }
  };

  const eliminarItem = async id => {
    try {
      const res = await fetch(`${API_URL}/api/carrito/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchCarrito();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch(`${API_URL}/api/pago/stripe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrito: items, usuarioId: usuario.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else addToast({ type: 'error', title: 'Pago', message: 'Error al crear sesión de pago' });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Pago', message: 'Error en el proceso de pago' });
    } finally {
      setCheckingOut(false);
    }
  };

  const total = items.reduce((acc, ci) => acc + Number(ci.Producto?.precio || 0) * ci.cantidad, 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-blue-600" />
            Tu Carrito
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse flex gap-5">
                  <div className="w-20 h-20 bg-slate-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                    <div className="h-8 bg-slate-100 rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Tu carrito está vacío</h3>
              <p className="text-slate-400 text-sm">Agrega productos desde la tienda para comenzar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {items.map(ci => {
                  const prod = ci.Producto;
                  if (!prod) return null;
                  return (
                    <div key={ci.id} className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-full sm:w-24 h-24 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img
                          src={prod.imagen || 'https://placehold.co/96?text=?'}
                          alt={prod.nombre}
                          className="w-20 h-20 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 truncate">{prod.nombre}</h4>
                        <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{prod.descripcion}</p>
                        <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => actualizarCantidad(ci.id, ci.cantidad - 1)}
                              className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition"
                            >
                              <Minus className="w-3.5 h-3.5 text-slate-600" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={ci.cantidad}
                              onChange={e => actualizarCantidad(ci.id, parseInt(e.target.value) || 1)}
                              className="w-12 text-center text-sm font-semibold border border-slate-200 rounded-lg py-1.5 outline-none focus:ring-2 focus:ring-blue-200"
                            />
                            <button
                              onClick={() => actualizarCantidad(ci.id, ci.cantidad + 1)}
                              className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition"
                            >
                              <Plus className="w-3.5 h-3.5 text-slate-600" />
                            </button>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-blue-600">
                              ${(prod.precio * ci.cantidad).toFixed(2)}
                            </span>
                            <button
                              onClick={() => eliminarItem(ci.id)}
                              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm sticky top-20">
                  <h3 className="font-bold text-slate-800 mb-4 text-base">Resumen del pedido</h3>
                  <div className="space-y-2 mb-4">
                    {items.map(ci => ci.Producto && (
                      <div key={ci.id} className="flex justify-between text-sm">
                        <span className="text-slate-500 truncate pr-2">{ci.Producto.nombre} ×{ci.cantidad}</span>
                        <span className="text-slate-700 font-medium flex-shrink-0">${(ci.Producto.precio * ci.cantidad).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center mb-5">
                    <span className="font-bold text-slate-800">Total</span>
                    <span className="font-extrabold text-blue-600 text-xl">${total.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow-sm shadow-blue-200 transition"
                  >
                    <CreditCard className="w-4 h-4" />
                    {checkingOut ? 'Procesando...' : 'Proceder al pago'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
