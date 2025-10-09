import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [correo, setCorreo] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async e => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contraseña }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.mensaje || 'Error al iniciar sesión');

            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Lado Izquierdo */}
            <div className="hidden lg:flex items-center justify-center w-1/2 bg-gradient-to-tr from-blue-700 to-slate-900 text-white p-10">
                <div className="text-center space-y-6">
                    <h2 className="text-4xl font-bold leading-snug">Bienvenido a GadgetDrop</h2>
                    <p className="text-lg">Explora los gadgets más novedosos del mercado</p>
                    <img
                        src="https://illustrations.popsy.co/gray/business-meeting.svg"
                        alt=""
                        className="w-3/4 mx-auto"
                    />
                </div>
            </div>

            {/* Formulario */}
            <div className="flex items-center justify-center w-full lg:w-1/2 p-8 sm:p-12">
                <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4 text-center">Iniciar sesión</h2>
                    <p className="text-center text-slate-500 mb-6">Accede a tu cuenta para continuar</p>

                    {error && (
                        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 border border-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block mb-1 text-slate-700 font-medium">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={correo}
                                onChange={e => setCorreo(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                                placeholder="usuario@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block mb-1 text-slate-700 font-medium">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={contraseña}
                                onChange={e => setContraseña(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                                placeholder="********"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all"
                        >
                            Iniciar sesión
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-600">
                        ¿No tienes cuenta?{' '}
                        <Link to="/registro" className="text-blue-600 font-medium hover:underline">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
