import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import RecomendacionesWidget from '../components/RecomendacionesWidget';
import { API_URL } from '../config';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  ShoppingBag, DollarSign, TrendingUp, Package,
  Cpu, BarChart2, Activity, Zap,
} from 'lucide-react';

const CAT_COLORS = {
  'Gaming': '#6366f1',
  'Workstation': '#0ea5e9',
  'Creadores de Contenido': '#f59e0b',
  'Accesorios Móviles': '#10b981',
  'Wearables': '#ec4899',
};
const FALLBACK_COLORS = ['#6366f1', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Skeleton({ h = 'h-8', w = 'w-full' }) {
  return <div className={`${h} ${w} bg-slate-100 rounded-xl animate-pulse`} />;
}

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [selectedProductoId, setSelectedProductoId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/api/admin/pedidos`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setPedidos(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingPedidos(false));

    fetch(`${API_URL}/api/productos`)
      .then(r => r.json())
      .then(data => setProductos(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingProductos(false));
  }, []);

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const activos = pedidos.filter(p =>
    ['entregado', 'enviado'].includes((p.estado || '').toLowerCase())
  );
  const ingresosTotales = activos.reduce((s, p) => s + parseFloat(p.total || 0), 0);
  const ticketPromedio = activos.length ? ingresosTotales / activos.length : 0;

  // ── Ventas por mes ───────────────────────────────────────────────────────────
  const mesMap = {};
  pedidos.forEach(p => {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('es', { month: 'short', year: '2-digit' });
    if (!mesMap[key]) mesMap[key] = { key, label, pedidos: 0, ingresos: 0 };
    mesMap[key].pedidos += 1;
    mesMap[key].ingresos += parseFloat(p.total || 0);
  });
  const chartVentas = Object.values(mesMap)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(m => ({ ...m, ingresos: parseFloat(m.ingresos.toFixed(2)) }));

  const ingresosMap = {};
  activos.forEach(p => {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('es', { month: 'short', year: '2-digit' });
    if (!ingresosMap[key]) ingresosMap[key] = { key, label, ingresos: 0 };
    ingresosMap[key].ingresos += parseFloat(p.total || 0);
  });
  const chartIngresos = Object.values(ingresosMap)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(m => ({ ...m, ingresos: parseFloat(m.ingresos.toFixed(2)) }));
  const maxIngresos = chartIngresos.length ? Math.max(...chartIngresos.map(d => d.ingresos)) : 0;

  // ── Top 10 productos ─────────────────────────────────────────────────────────
  const prodMap = {};
  pedidos.forEach(p => {
    (p.DetallePedidos || p.DetallePedido || p.detalle || []).forEach(d => {
      const nombre = d.Producto?.nombre || `Prod #${d.productoId}`;
      const cat = d.Producto?.categoria || 'Otros';
      if (!prodMap[nombre]) prodMap[nombre] = { nombre, cantidad: 0, categoria: cat };
      prodMap[nombre].cantidad += d.cantidad;
    });
  });
  const top10 = Object.values(prodMap)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);

  // ── Ingresos por categoría ───────────────────────────────────────────────────
  const catMap = {};
  activos.forEach(p => {
    (p.DetallePedidos || p.DetallePedido || p.detalle || []).forEach(d => {
      const cat = d.Producto?.categoria || 'Otros';
      catMap[cat] = (catMap[cat] || 0) + d.cantidad * parseFloat(d.precioUnitario || 0);
    });
  });
  const chartCat = Object.entries(catMap).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  const fmt$ = v => `$${Number(v).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-50">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-6 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Modelo ML Activo
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Dashboard de Análisis — GadgetDrop
                </h1>
                <p className="text-slate-400 mt-1.5 text-sm flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  Módulo de Ciencia de Datos
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

          {/* ── KPIs ────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                label: 'Total pedidos',
                value: loadingPedidos ? null : pedidos.length,
                icon: ShoppingBag,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                label: 'Ingresos totales',
                value: loadingPedidos ? null : fmt$(ingresosTotales),
                icon: DollarSign,
                color: 'text-green-600',
                bg: 'bg-green-50',
              },
              {
                label: 'Ticket promedio',
                value: loadingPedidos ? null : fmt$(ticketPromedio),
                icon: TrendingUp,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
              },
              {
                label: 'Productos activos',
                value: loadingProductos ? null : productos.length,
                icon: Package,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
              },
            ].map(kpi => (
              <Card key={kpi.label}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center flex-shrink-0`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide leading-tight">
                      {kpi.label}
                    </p>
                    {kpi.value === null
                      ? <Skeleton h="h-7" w="w-20" />
                      : <p className="text-2xl font-bold text-slate-800 mt-0.5 truncate">{kpi.value}</p>
                    }
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* ── Pedidos + Ingresos por mes ──────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <SectionTitle
                icon={TrendingUp}
                title="Pedidos por Mes"
                subtitle="Cantidad de órdenes procesadas"
              />
              {loadingPedidos ? (
                <Skeleton h="h-64" />
              ) : chartVentas.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-20">Sin datos suficientes</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartVentas} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={v => [`${v} pedidos`, 'Pedidos']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="pedidos"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      name="Pedidos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <SectionTitle
                icon={TrendingUp}
                title="Ingresos por Mes"
                subtitle="Solo pedidos entregados y enviados"
              />
              {loadingPedidos ? (
                <Skeleton h="h-64" />
              ) : chartIngresos.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-20">Sin datos suficientes</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chartIngresos} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="fillIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={v => `$${Number(v).toLocaleString('en', { maximumFractionDigits: 0 })}`}
                      domain={[0, maxIngresos * 1.2]}
                    />
                    <Tooltip formatter={v => [fmt$(v), 'Ingresos']} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="ingresos"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#fillIngresos)"
                      name="Ingresos ($)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* ── BarChart + PieChart ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <SectionTitle
                icon={BarChart2}
                title="Top 10 Productos Más Vendidos"
                subtitle="Por unidades vendidas"
              />
              {loadingPedidos ? (
                <Skeleton h="h-72" />
              ) : top10.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-20">Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    layout="vertical"
                    data={top10}
                    margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="nombre"
                      width={128}
                      tick={{ fontSize: 10 }}
                      tickFormatter={v => v.length > 18 ? v.slice(0, 17) + '…' : v}
                    />
                    <Tooltip />
                    <Bar dataKey="cantidad" name="Unidades" radius={[0, 4, 4, 0]}>
                      {top10.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={CAT_COLORS[entry.categoria] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <SectionTitle
                icon={Activity}
                title="Ingresos por Categoría"
                subtitle="Solo pedidos entregados y enviados"
              />
              {loadingPedidos ? (
                <Skeleton h="h-72" />
              ) : chartCat.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-20">Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={320} className="mt-8">
                  <PieChart>
                    <Pie
                      data={chartCat}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="55%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name.length > 10 ? name.slice(0, 10) + '…' : name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {chartCat.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={CAT_COLORS[entry.name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => fmt$(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* ── Motor de Recomendaciones ─────────────────────────────────────── */}
          <Card>
            <SectionTitle
              icon={Cpu}
              title="Motor de Recomendaciones Inteligente"
              subtitle="Basado en Filtrado Colaborativo por Similitud de Coseno"
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Selector + explicación */}
              <div className="xl:col-span-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Seleccionar producto
                  </label>
                  {loadingProductos ? (
                    <Skeleton h="h-10" />
                  ) : (
                    <select
                      value={selectedProductoId}
                      onChange={e => setSelectedProductoId(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                    >
                      <option value="">— Elige un producto —</option>
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-700 space-y-2 leading-relaxed">
                  <p className="font-semibold text-indigo-800">¿Cómo funciona?</p>
                  <p>
                    El modelo construye una matriz de interacciones pedido‑producto y calcula
                    la <strong>similitud coseno</strong> entre ítems.
                  </p>
                  <p>
                    Productos con patrones de co‑compra similares reciben puntuaciones altas,
                    permitiendo descubrir relaciones no obvias entre categorías.
                  </p>
                  <p className="text-indigo-500 font-medium pt-1">
                    Algoritmo: Item‑Based Collaborative Filtering · sklearn
                  </p>
                </div>
              </div>

              {/* Widget */}
              <div className="xl:col-span-2">
                {selectedProductoId ? (
                  <RecomendacionesWidget productoId={Number(selectedProductoId)} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                    <Cpu className="w-12 h-12 text-slate-200 mb-3" />
                    <p className="text-slate-400 text-sm">
                      Selecciona un producto para ver sus recomendaciones
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

        </div>
      </div>
    </>
  );
}
