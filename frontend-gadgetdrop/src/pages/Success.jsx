import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Package, Loader2 } from 'lucide-react';
import { API_URL } from '../config';

export default function Success() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const guardarPedido = async () => {
      const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
      if (!usuario.id) return;

      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      const sessionKey = sessionId
        ? `pedido_guardado_${usuario.id}_${sessionId}`
        : `pedido_guardado_${usuario.id}`;
      if (sessionStorage.getItem(sessionKey)) { setSaved(true); return; }

      try {
        const resCarrito = await fetch(`${API_URL}/api/carrito/${usuario.id}`);
        const carrito = await resCarrito.json();
        if (!Array.isArray(carrito) || carrito.length === 0) { setSaved(true); return; }

        const payload = { usuarioId: usuario.id, carrito };
        if (sessionId) payload.externalId = sessionId;

        const res = await fetch(`${API_URL}/api/pedidos/pagado`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) sessionStorage.setItem(sessionKey, '1');
      } catch (err) {
        console.error('Error al guardar pedido:', err);
      } finally {
        setSaved(true);
      }
    };

    guardarPedido();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-10 text-center">
          {/* Icon */}
          <div className="relative inline-flex mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">¡Pago exitoso!</h2>
          <p className="text-slate-500 text-base leading-relaxed mb-2">
            Gracias por tu compra. Hemos recibido tu pago correctamente.
          </p>
          <p className="text-sm text-slate-400 mb-8">
            Recibirás una confirmación por correo electrónico en breve.
          </p>

          {!saved && (
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              Registrando tu pedido...
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-5 rounded-xl transition"
            >
              <Home className="w-4 h-4" />
              Volver al inicio
            </button>
            <button
              onClick={() => navigate('/pedidos')}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-xl shadow-sm shadow-blue-200 transition"
            >
              <Package className="w-4 h-4" />
              Ver mis pedidos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
