import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const cerrarSesion = () => {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="bg-slate-900 text-white px-6 py-4 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo o nombre */}
                <Link to="/" className="text-xl font-bold text-yellow-400 tracking-wide">
                    GadgetDrop
                </Link>

                {/* Links */}
                <div className="space-x-6 hidden md:flex items-center text-sm font-medium">
                    <Link to="/" className="hover:text-yellow-400 transition">Inicio</Link>
                    <Link to="/carrito" className="hover:text-yellow-400 transition">Carrito</Link>
                    <Link to="/pedidos" className="hover:text-yellow-400 transition">Mis Pedidos</Link>
                    {usuario?.rol === 'admin' && (
                        <Link to="/admin/pedidos" className="hover:text-yellow-400 transition">Admin</Link>
                    )}
                </div>

                {/* Acciones */}
                <div className="space-x-3 text-sm">
                    {usuario ? (
                        <button
                            onClick={cerrarSesion}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition"
                        >
                            Cerrar sesión
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition"
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                to="/registro"
                                className="border border-white hover:bg-white hover:text-slate-900 px-4 py-2 rounded-lg transition"
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
