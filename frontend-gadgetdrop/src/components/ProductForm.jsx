import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition bg-white placeholder-slate-300";

export default function ProductForm({ initial = null, onSubmit, onCancel }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [imagen, setImagen] = useState('');

  useEffect(() => {
    if (initial) {
      setNombre(initial.nombre || '');
      setDescripcion(initial.descripcion || '');
      setPrecio(initial.precio ?? '');
      setStock(initial.stock ?? '');
      setImagen(initial.imagen || '');
    }
  }, [initial]);

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      nombre,
      descripcion,
      precio: parseFloat(precio),
      stock: stock === '' ? undefined : parseInt(stock, 10),
      imagen,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre">
          <input value={nombre} onChange={e => setNombre(e.target.value)} className={inputCls} placeholder="Nombre del producto" required />
        </Field>
        <Field label="Precio (USD)">
          <input value={precio} onChange={e => setPrecio(e.target.value)} type="number" step="0.01" min="0" className={inputCls} placeholder="0.00" required />
        </Field>
        <Field label="Descripción">
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            className={`${inputCls} resize-none`}
            rows={2}
            placeholder="Descripción breve"
          />
        </Field>
        <Field label="Stock">
          <input value={stock} onChange={e => setStock(e.target.value)} type="number" min="0" className={inputCls} placeholder="0" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Imagen (URL)">
            <input value={imagen} onChange={e => setImagen(e.target.value)} type="url" className={inputCls} placeholder="https://example.com/imagen.jpg" />
          </Field>
          {imagen && (
            <div className="mt-2 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <img src={imagen} alt="Vista previa" className="h-16 w-16 object-contain rounded-lg border border-slate-200 bg-white" />
              <span className="text-xs text-slate-400 truncate flex-1">{imagen}</span>
            </div>
          )}
          {!imagen && (
            <div className="mt-2 flex items-center gap-2 text-slate-300 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 justify-center">
              <ImageIcon className="w-5 h-5" />
              <span className="text-xs">Vista previa de imagen</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
        >
          {initial ? 'Guardar cambios' : 'Crear producto'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-none border border-slate-200 text-slate-600 hover:bg-slate-50 px-6 py-2.5 rounded-xl text-sm font-medium transition"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
