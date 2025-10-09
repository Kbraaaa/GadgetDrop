// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    // Si no hay token, redirige a /login; si lo hay, muestra el contenido
    return token ? children : <Navigate to="/login" replace />;
}
