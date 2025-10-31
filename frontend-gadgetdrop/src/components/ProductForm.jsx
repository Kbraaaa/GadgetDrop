import React, { useState, useEffect } from 'react';

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
    const payload = { nombre, descripcion, precio: parseFloat(precio), stock: stock === '' ? undefined : parseInt(stock, 10), imagen };
    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nombre</label>
          <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full border border-slate-200 px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Precio</label>
          <input value={precio} onChange={e => setPrecio(e.target.value)} type="number" step="0.01" className="w-full border border-slate-200 px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" required />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Descripción</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full border border-slate-200 px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Stock</label>
          <input value={stock} onChange={e => setStock(e.target.value)} type="number" min="0" className="w-full border border-slate-200 px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Imagen (URL)</label>
          <input value={imagen} onChange={e => setImagen(e.target.value)} type="text" className="w-full border border-slate-200 px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="https://example.com/imagen.jpg" />
          {imagen && (
            <div className="mt-2">
              <img src={imagen} alt="vista previa" className="h-24 object-contain rounded border" />
            </div>
          )}
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow">{initial ? 'Guardar' : 'Crear'}</button>
          {onCancel && <button type="button" onClick={onCancel} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded">Cancelar</button>}
        </div>
      </div>
    </form>
  );
}
