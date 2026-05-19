import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, Home, Headphones, Shield, LogOut, Menu, X, Zap, BarChart2 } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const [mobileOpen, setMobileOpen] = useState(false);

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/carrito', label: 'Carrito', icon: ShoppingCart },
    { to: '/pedidos', label: 'Mis Pedidos', icon: Package },
    { to: '/support', label: 'Soporte', icon: Headphones },
    ...(usuario?.rol === 'admin' ? [
      { to: '/admin', label: 'Admin', icon: Shield },
      { to: '/dashboard', label: 'Dashboard', icon: BarChart2 },
    ] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-yellow-400 font-extrabold text-xl tracking-wide hover:text-yellow-300 transition">
            <Zap className="w-5 h-5" />
            GadgetDrop
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition
                  ${isActive(to)
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {usuario ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {(usuario.nombre || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300 font-medium max-w-[120px] truncate">
                    {usuario.nombre?.split(' ')[0] || 'Usuario'}
                  </span>
                </div>
                <button
                  onClick={cerrarSesion}
                  className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/40 hover:border-red-600 text-red-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  className="border border-slate-600 hover:border-slate-400 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-700/60 bg-slate-900">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${isActive(to)
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-slate-700/60">
            {usuario ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {(usuario.nombre || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300">{usuario.nombre?.split(' ')[0] || 'Usuario'}</span>
                </div>
                <button
                  onClick={cerrarSesion}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm font-medium transition"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
                  Iniciar sesión
                </Link>
                <Link to="/registro" onClick={() => setMobileOpen(false)} className="flex-1 text-center border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
