
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Success from './pages/Success';
import Pedidos from './pages/Pedidos';
import PrivateRoute from './components/PrivateRoute';
import Registro from './pages/Registro';


export default function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/carrito" element={<Cart />} />
      <Route path="/success" element={<Success />} />

      {/* Rutas privadas */}
      <Route path="/pedidos" element={
        <PrivateRoute>
          <Pedidos />
        </PrivateRoute>
      } />
      <Route path="/registro" element={<Registro />} />
      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
