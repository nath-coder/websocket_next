'use client';

import React, { useState, useEffect } from 'react';
import { ProductoCreate, ProductoResponse, ProductoUpdate } from '@/types/producto';

interface ProductoFormProps {
  producto?: ProductoResponse;
  onSubmit: (producto: ProductoCreate | ProductoUpdate) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const ProductoForm = ({ producto, onSubmit, onCancel, isEditing = false }: ProductoFormProps) => {
  const [formData, setFormData] = useState({
    nombre: '',
    cantidad: 0,
    precio: 0
  });

  // Sincronizar form data con producto prop usando useMemo para evitar re-renders
  const initialFormData = React.useMemo(() => {
    if (producto) {
      return {
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        precio: producto.precio
      };
    }
    return { nombre: '', cantidad: 0, precio: 0 };
  }, [producto]);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!isEditing) {
      setFormData({ nombre: '', cantidad: 0, precio: 0 });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidad' ? parseInt(value) || 0 : 
               name === 'precio' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nombre del producto"
          />
        </div>

        <div>
          <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad
          </label>
          <input
            type="number"
            id="cantidad"
            name="cantidad"
            value={formData.cantidad}
            onChange={handleChange}
            min="0"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
            Precio
          </label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {isEditing ? 'Actualizar' : 'Crear'}
        </button>
        
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};