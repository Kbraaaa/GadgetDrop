import { useState, useEffect } from 'react';
import { useToast } from './Toast';
import { API_URL } from '../config';
import { MessageSquare, X, Mail, Clock, CheckCircle, AlertTriangle, Send } from 'lucide-react';

export default function AdminSupport() {
  const token = localStorage.getItem('token');
  const [mensajes, setMensajes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const { addToast } = useToast();

  async function fetchMensajes() {
    try {
      const res = await fetch(`${API_URL}/api/admin/support`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('No autorizado');
      const data = await res.json();
      setMensajes(data.mensajes || []);
    } catch (e) {
      console.error(e);
      addToast({ type: 'error', title: 'Soporte', message: 'No se pudieron cargar los mensajes' });
    }
  }

  useEffect(() => { fetchMensajes(); }, []);

  function handleOpen(m) {
    setSelected(m);
    setReply('');
    setModalVisible(true);
    setTimeout(() => setAnimating(true), 20);
  }

  function closeModalAnimated() {
    setAnimating(false);
    setTimeout(() => { setModalVisible(false); setSelected(null); }, 300);
  }

  async function handleReply() {
    if (!reply.trim()) return addToast({ type: 'error', title: 'Soporte', message: 'Escribe una respuesta' });
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/support/${selected.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply, close: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al responder');
      if (data.emailEnviado) {
        addToast({ type: 'success', title: 'Soporte', message: 'Respuesta enviada correctamente' });
      } else {
        addToast({ type: 'warning', title: 'Soporte', message: 'Respuesta guardada pero el correo no pudo enviarse al usuario' });
      }
      const newReply = { text: reply, at: new Date().toISOString(), emailEnviado: data.emailEnviado };
      setSelected(prev => ({
        ...prev,
        metadata: {
          ...(prev.metadata || {}),
          replies: [...((prev.metadata?.replies) || []), newReply],
          lastReply: newReply,
        },
      }));
      setReply('');
      fetchMensajes();
    } catch (e) {
      addToast({ type: 'error', title: 'Soporte', message: e.message || 'Error' });
    } finally {
      setSending(false);
    }
  }

  async function handleClose() {
    try {
      const res = await fetch(`${API_URL}/api/admin/support/${selected.id}/close`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cerrar');
      addToast({ type: 'success', title: 'Soporte', message: 'Ticket cerrado' });
      closeModalAnimated();
      fetchMensajes();
    } catch (e) {
      addToast({ type: 'error', title: 'Soporte', message: e.message || 'Error' });
    }
  }

  const openCount = mensajes.filter(m => m.status === 'open').length;
  const closedCount = mensajes.filter(m => m.status !== 'open').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Soporte al cliente</h2>
        <p className="text-sm text-slate-500 mt-0.5">Responde y gestiona tickets de soporte</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total tickets</p>
          <p className="text-3xl font-bold text-slate-700 mt-1">{mensajes.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Abiertos</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{openCount}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Cerrados</p>
          <p className="text-3xl font-bold text-slate-500 mt-1">{closedCount}</p>
        </div>
      </div>

      {mensajes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="w-14 h-14 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No hay mensajes de soporte</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mensajes.map(m => {
            const isOpen = m.status === 'open';
            return (
              <div
                key={m.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${isOpen ? 'border-slate-200' : 'border-slate-100 opacity-75'}`}
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isOpen ? 'bg-blue-50' : 'bg-slate-100'}`}>
                      <MessageSquare className={`w-5 h-5 ${isOpen ? 'text-blue-500' : 'text-slate-400'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm">{m.nombre}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${isOpen ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {isOpen ? <><CheckCircle className="w-3 h-3" /> Abierto</> : 'Cerrado'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-600 mt-0.5 truncate">{m.asunto || 'Sin asunto'}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{m.correo}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(m.createdAt).toLocaleDateString('es')}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpen(m)}
                    className="sm:flex-shrink-0 inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
                  >
                    Ver ticket
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalVisible && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className={`fixed inset-0 bg-black transition-opacity duration-300 ${animating ? 'opacity-40' : 'opacity-0'}`}
            onClick={closeModalAnimated}
          />
          <div className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full z-10 overflow-hidden transform transition-all duration-300 ${animating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}>
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h4 className="text-lg font-bold text-slate-800">{selected.asunto || 'Sin asunto'}</h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  De <span className="font-medium text-slate-700">{selected.nombre}</span>
                  {' · '}
                  <span className="text-slate-400">{selected.correo}</span>
                </p>
              </div>
              <button
                onClick={closeModalAnimated}
                className="text-slate-400 hover:text-slate-700 transition ml-4 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Mensaje del cliente</p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selected.mensaje}
                </div>
              </div>

              {selected.metadata?.replies?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Historial de respuestas ({selected.metadata.replies.length})
                  </p>
                  <div className="space-y-3">
                    {selected.metadata.replies.map((r, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700">
                        <p className="whitespace-pre-wrap leading-relaxed">{r.text}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                          <span>{new Date(r.at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          <span title={r.emailEnviado ? 'Correo enviado correctamente' : 'El correo no pudo enviarse'}>
                            {r.emailEnviado ? '✉️' : '⚠️'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Tu respuesta</p>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={5}
                  placeholder="Escribe tu respuesta aquí..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={handleReply}
                disabled={sending || !reply.trim()}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Enviando...' : 'Enviar respuesta'}
              </button>
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                <CheckCircle className="w-4 h-4" />
                Cerrar ticket
              </button>
              <button
                onClick={closeModalAnimated}
                className="ml-auto text-slate-500 hover:text-slate-700 text-sm font-medium transition px-3 py-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
