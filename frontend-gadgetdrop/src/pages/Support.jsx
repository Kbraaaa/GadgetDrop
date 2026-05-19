import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';
import { API_URL } from '../config';
import { HelpCircle, MessageSquare, ChevronDown, ChevronUp, Send, Loader2 } from 'lucide-react';

const faqs = [
  { q: '¿Cómo veo mis pedidos?', a: 'Ve a Mis Pedidos en el menú y podrás ver el historial completo y el estado de cada pedido.' },
  { q: '¿Puedo cancelar un pedido?', a: 'Si el pedido aún está en estado pendiente, contacta a soporte con tu número de pedido y lo gestionaremos.' },
  { q: '¿Cuánto tarda el envío?', a: 'Los tiempos de envío varían según la ubicación. Normalmente entre 3 y 7 días hábiles.' },
  { q: '¿Cómo cambio mi dirección de envío?', a: 'Contacta a soporte con la dirección nueva antes de que el pedido sea enviado y lo actualizaremos.' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all ${open ? 'border-blue-200 shadow-sm' : 'border-slate-100'}`}>
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-slate-800 text-sm">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-blue-500 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

function TicketSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse space-y-3">
      <div className="flex justify-between items-start">
        <div className="h-4 bg-slate-100 rounded w-1/3" />
        <div className="h-5 bg-slate-100 rounded w-16" />
      </div>
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
      <div className="h-3 bg-slate-100 rounded w-24" />
    </div>
  );
}

const inputCls = "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition bg-white placeholder-slate-300";

export default function Support() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const { addToast } = useToast();

  async function fetchTickets() {
    const token = localStorage.getItem('token');
    if (!token) return;
    setTicketsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/support/mis-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  }

  useEffect(() => {
    if (usuario) fetchTickets();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre || !correo || !mensaje) {
      addToast({ type: 'error', title: 'Soporte', message: 'Completa los campos requeridos' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/support/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, asunto, mensaje, usuarioId: usuario?.id || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar mensaje');
      addToast({ type: 'success', title: 'Soporte', message: 'Mensaje enviado. Te responderemos pronto.' });
      setNombre(''); setCorreo(''); setAsunto(''); setMensaje('');
      if (usuario) fetchTickets();
    } catch (err) {
      addToast({ type: 'error', title: 'Soporte', message: err.message || 'Error al enviar mensaje' });
    } finally {
      setLoading(false);
    }
  }

  const toggle = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-12 px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            Centro de ayuda
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">¿En qué podemos ayudarte?</h1>
          <p className="text-slate-300 max-w-md mx-auto text-sm">
            Consulta las preguntas frecuentes o envíanos un mensaje directo y te responderemos pronto.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold text-slate-800">Preguntas frecuentes</h2>
              </div>
              <div className="space-y-3">
                {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-5">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold text-slate-800">Contacta al soporte</h2>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                        Nombre <span className="text-red-400">*</span>
                      </label>
                      <input
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        className={inputCls}
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                        Correo <span className="text-red-400">*</span>
                      </label>
                      <input
                        value={correo}
                        onChange={e => setCorreo(e.target.value)}
                        type="email"
                        className={inputCls}
                        placeholder="tu@correo.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Asunto <span className="text-slate-300">(opcional)</span>
                    </label>
                    <input
                      value={asunto}
                      onChange={e => setAsunto(e.target.value)}
                      className={inputCls}
                      placeholder="¿Sobre qué trata tu mensaje?"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Mensaje <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={mensaje}
                      onChange={e => setMensaje(e.target.value)}
                      rows={5}
                      className={`${inputCls} resize-none`}
                      placeholder="Describe tu consulta con el mayor detalle posible..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow-sm shadow-blue-200 transition"
                  >
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                      : <><Send className="w-4 h-4" /> Enviar mensaje</>
                    }
                  </button>
                </form>
              </div>
            </div>
          </div>

          {usuario && (
            <div className="mt-12">
              <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-200">
                <MessageSquare className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <h2 className="text-xl font-bold text-slate-800">Mis consultas anteriores</h2>
                {!ticketsLoading && (
                  <span className="ml-auto bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {tickets.length}
                  </span>
                )}
              </div>

              {ticketsLoading ? (
                <div className="space-y-3">
                  <TicketSkeleton />
                  <TicketSkeleton />
                </div>
              ) : tickets.length === 0 ? (
                <p className="text-sm text-slate-400">No tienes consultas anteriores</p>
              ) : (
                <div className="space-y-3">
                  {tickets.map(t => {
                    const isOpen = t.status === 'open';
                    const hasReplies = t.replies && t.replies.length > 0;
                    const isExpanded = expanded[t.id];

                    return (
                      <div key={t.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-semibold text-slate-800 text-sm">{t.asunto || 'Sin asunto'}</h3>
                            <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                              isOpen
                                ? 'bg-amber-50 text-amber-500'
                                : 'bg-emerald-50 text-emerald-500'
                            }`}>
                              {isOpen ? 'Abierto' : 'Cerrado'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed">
                            {t.mensaje.length > 100 ? t.mensaje.slice(0, 100) + '...' : t.mensaje}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-slate-400">
                              {new Date(t.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            {hasReplies ? (
                              <button
                                onClick={() => toggle(t.id)}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                              >
                                {isExpanded
                                  ? <><ChevronUp className="w-4 h-4" /> Ocultar respuesta</>
                                  : <><ChevronDown className="w-4 h-4" /> Ver respuesta ({t.replies.length})</>
                                }
                              </button>
                            ) : (
                              <p className="text-xs text-slate-400 italic">Sin respuesta aún</p>
                            )}
                          </div>
                        </div>

                        {isExpanded && hasReplies && (
                          <div className="border-t border-slate-100 px-5 py-4 space-y-3" style={{ backgroundColor: '#f8fafc' }}>
                            {t.replies.map((r, i) => (
                              <div key={i}>
                                {i > 0 && <div className="border-t border-slate-100 pt-3" />}
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{r.text}</p>
                                <p className="text-xs text-slate-400 mt-1.5">
                                  {new Date(r.at).toLocaleDateString('es', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
