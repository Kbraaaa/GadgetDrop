import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';

export default function Support() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const faqs = [
    { q: '¿Cómo veo mis pedidos?', a: 'Ve a Mis Pedidos (Menú) y podrás ver el historial y el estado de cada pedido.' },
    { q: '¿Puedo cancelar un pedido?', a: 'Si el pedido aún está en estado pendiente, contacta a soporte con tu número de pedido.' },
    { q: '¿Cuánto tarda el envío?', a: 'Los tiempos de envío varían según la ubicación. Normalmente 3-7 días hábiles.' },
    { q: '¿Cómo cambio mi dirección?', a: 'Edita tu perfil o contacta a soporte con la dirección nueva antes de que el pedido sea enviado.' }
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre || !correo || !mensaje) {
      addToast({ type: 'error', title: 'Soporte', message: 'Completa los campos requeridos' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/support/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, asunto, mensaje })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar mensaje');
      addToast({ type: 'success', title: 'Soporte', message: 'Mensaje enviado. Te responderemos pronto.' });
      setNombre(''); setCorreo(''); setAsunto(''); setMensaje('');
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Soporte', message: err.message || 'Error al enviar mensaje' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 md:p-12">
        <h1 className="text-3xl font-bold mb-6">Soporte & FAQ</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Preguntas frecuentes</h2>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <div key={i} className="p-4 bg-white rounded-lg shadow-sm">
                  <p className="font-medium">{f.q}</p>
                  <p className="text-sm text-slate-600 mt-1">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Contacta al soporte</h2>
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input value={nombre} onChange={e=>setNombre(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Correo</label>
                <input value={correo} onChange={e=>setCorreo(e.target.value)} type="email" className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Asunto (opcional)</label>
                <input value={asunto} onChange={e=>setAsunto(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mensaje</label>
                <textarea value={mensaje} onChange={e=>setMensaje(e.target.value)} rows={6} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" disabled={loading}>{loading? 'Enviando...':'Enviar mensaje'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
