import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { API_URL } from '../config';
import { Zap, AlertCircle, Mail, Lock, User, UserPlus } from 'lucide-react';

const inputCls = "w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition bg-white placeholder-slate-300";

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleRegistro = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, contraseña }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error al registrar');
      addToast({ type: 'success', title: 'Registro', message: 'Cuenta creada correctamente' });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent" />
        <div className="relative text-center space-y-6 max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-8 h-8 text-yellow-400" />
            <span className="text-3xl font-extrabold text-yellow-400 tracking-wide">GadgetDrop</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight">Únete a nosotros</h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Crea tu cuenta gratis y accede a los mejores gadgets tecnológicos del mercado.
          </p>
          <img
            src="https://illustrations.popsy.co/gray/design-team.svg"
            alt=""
            className="w-3/4 mx-auto opacity-90"
          />
        </div>
      </div>

      <div className="flex items-center justify-center w-full lg:w-1/2 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <Zap className="w-6 h-6 text-yellow-500" />
            <span className="text-2xl font-extrabold text-slate-800 tracking-wide">GadgetDrop</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1 text-center">Crear cuenta</h2>
            <p className="text-center text-slate-400 text-sm mb-7">Completa el formulario para comenzar</p>

            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleRegistro} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className={inputCls}
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="email"
                    value={correo}
                    onChange={e => setCorreo(e.target.value)}
                    className={inputCls}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="password"
                    value={contraseña}
                    onChange={e => setContraseña(e.target.value)}
                    className={inputCls}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow-sm shadow-blue-200 transition"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? 'Creando cuenta...' : 'Registrarse'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
