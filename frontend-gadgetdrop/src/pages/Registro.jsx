import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Registro() {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegistro = async e => {
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch('http://localhost:5000/api/auth/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, correo, contraseña })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.mensaje || 'Error al registrar');

            alert('Usuario registrado con éxito');
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Lado visual */}
            <div className="hidden lg:flex items-center justify-center w-1/2 bg-gradient-to-tr from-yellow-400 to-blue-600 text-white p-10">
                <div className="text-center space-y-6">
                    <h2 className="text-4xl font-bold leading-snug">Crea tu cuenta</h2>
                    <p className="text-lg">Únete a la comunidad de tecnología más innovadora</p>
                    <img
                        src="https://illustrations.popsy.co/gray/design-team.svg"
                        alt=""
                        className="w-3/4 mx-auto"
                    />
                </div>
            </div>

            {/* Formulario */}
            <div className="flex items-center justify-center w-full lg:w-1/2 p-8 sm:p-12">
                <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4 text-center">Registro</h2>
                    <p className="text-center text-slate-500 mb-6">Completa el formulario para comenzar</p>

                    {error && (
                        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 border border-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegistro} className="space-y-5">
                        <div>
                            <label className="block mb-1 text-slate-700 font-medium">Nombre completo</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="Tu nombre"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-slate-700 font-medium">Correo electrónico</label>
                            <input
                                type="email"
                                value={correo}
                                onChange={e => setCorreo(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="correo@ejemplo.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-slate-700 font-medium">Contraseña</label>
                            <input
                                type="password"
                                value={contraseña}
                                onChange={e => setContraseña(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="********"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all"
                        >
                            Registrarse
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-600">
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="text-blue-600 font-medium hover:underline">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
