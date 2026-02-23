import { ProductoCreate, ProductoUpdate, ProductoResponse } from '@/types/producto';

const API_BASE_URL = 'http://localhost:8000';

// Función helper para manejar errores de respuesta
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // Si no se puede parsear el JSON, usar el status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const productoService = {
  // Verificar estado de la API
  verificarEstado: async (): Promise<{status: string, message: string}> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(`No se puede conectar al servidor: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Obtener todos los productos
  obtenerProductos: async (skip: number = 0, limit: number = 100): Promise<ProductoResponse[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/productos/?skip=${skip}&limit=${limit}`);
      return await handleResponse(response);
    } catch (error) {
      throw new Error(`Error obteniendo productos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Obtener producto por ID
  obtenerProducto: async (id: number): Promise<ProductoResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/productos/${id}`);
      return await handleResponse(response);
    } catch (error) {
      throw new Error(`Error obteniendo producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Crear producto
  crearProducto: async (producto: ProductoCreate): Promise<ProductoResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/productos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(producto),
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(`Error creando producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Actualizar producto
  actualizarProducto: async (id: number, producto: ProductoUpdate): Promise<ProductoResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(producto),
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(`Error actualizando producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Eliminar producto
  eliminarProducto: async (id: number): Promise<{message: string}> => {
    try {
      const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'DELETE',
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(`Error eliminando producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Buscar productos
  buscarProductos: async (nombre: string): Promise<ProductoResponse[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/productos/buscar/${encodeURIComponent(nombre)}`);
      return await handleResponse(response);
    } catch (error) {
      throw new Error(`Error buscando productos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Obtener número de conexiones WebSocket
  obtenerConexiones: async (): Promise<{active_connections: number}> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ws/connections`);
      return await handleResponse(response);
    } catch (error) {
      throw new Error(`Error obteniendo conexiones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },
};