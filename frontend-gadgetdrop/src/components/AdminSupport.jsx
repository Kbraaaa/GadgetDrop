import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';

export default function AdminSupport() {
  const token = localStorage.getItem('token');
  const [mensajes, setMensajes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [reply, setReply] = useState('');
  const { addToast } = useToast();

  async function fetchMensajes() {
    try {
      const res = await fetch('http://localhost:5000/api/admin/support', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('No autorizado');
      const data = await res.json();
      setMensajes(data.mensajes || []);
    } catch (e) {
      console.error(e);
      addToast({ type: 'error', title: 'Soporte', message: 'No se pudieron cargar los mensajes' });
    }
  }

  useEffect(() => { fetchMensajes(); }, []);

  async function handleOpen(m) {
    setSelected(m);
    setReply('');
    setModalVisible(true);
    // start enter animation on next tick
    setTimeout(() => setAnimating(true), 20);
  }

  async function handleReply() {
    if (!reply) return addToast({ type: 'error', title: 'Soporte', message: 'Escribe una respuesta' });
    try {
      const res = await fetch(`http://localhost:5000/api/admin/support/${selected.id}/reply`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply, close: false })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al responder');
      addToast({ type: 'success', title: 'Soporte', message: 'Respuesta enviada' });
      fetchMensajes();
    } catch (e) {
      console.error(e);
      addToast({ type: 'error', title: 'Soporte', message: e.message || 'Error' });
    }
  }

  async function handleClose() {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/support/${selected.id}/close`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cerrar');
      addToast({ type: 'success', title: 'Soporte', message: 'Mensaje cerrado' });
      // animate modal out
      setAnimating(false);
      setTimeout(() => {
        setModalVisible(false);
        setSelected(null);
      }, 300);
      fetchMensajes();
    } catch (e) {
      console.error(e);
      addToast({ type: 'error', title: 'Soporte', message: e.message || 'Error' });
    }
  }

  function closeModalAnimated() {
    setAnimating(false);
    setTimeout(() => {
      setModalVisible(false);
      setSelected(null);
    }, 300);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Mensajes de Soporte</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1">
          <ul className="space-y-2">
            {mensajes.map(m => (
              <li key={m.id} className={`p-3 rounded border ${m.status==='open'? 'bg-white':'bg-slate-50'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{m.nombre} <span className="text-sm text-slate-500">({m.correo})</span></p>
                    <p className="text-sm text-slate-600">{m.asunto || 'Sin asunto'}</p>
                    <p className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="ml-2">
                    <button onClick={()=>handleOpen(m)} className="text-blue-600 hover:underline">Abrir</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2">
          <div className="text-slate-500">Selecciona un mensaje para ver detalles</div>

          {modalVisible && selected && (
            <div className="fixed inset-0 z-60 flex items-center justify-center">
              <div className={`fixed inset-0 bg-black transition-opacity duration-300 ${animating ? 'bg-opacity-40 opacity-100' : 'bg-opacity-0 opacity-0'}`} onClick={closeModalAnimated} />
              <div className={`bg-white rounded-lg shadow-xl max-w-3xl w-full z-50 p-6 mx-4 transform transition-all duration-300 ${animating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-semibold">{selected.asunto || 'Sin asunto'}</h4>
                    <p className="text-sm text-slate-600">De {selected.nombre} — {selected.correo}</p>
                  </div>
                  <button onClick={closeModalAnimated} className="text-slate-500 hover:text-slate-700">Cerrar ✕</button>
                </div>

                <div className="mt-4">
                  <p className="whitespace-pre-wrap border rounded p-3 bg-slate-50">{selected.mensaje}</p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Respuesta</label>
                  <textarea value={reply} onChange={e=>setReply(e.target.value)} rows={6} className="w-full px-3 py-2 border rounded" />
                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={handleReply} className="bg-green-600 text-white px-4 py-2 rounded">Enviar respuesta</button>
                  <button onClick={handleClose} className="bg-red-600 text-white px-4 py-2 rounded">Cerrar</button>
                  <button onClick={()=>setSelected(null)} className="ml-auto border px-4 py-2 rounded">Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
