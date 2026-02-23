'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductoResponse, ProductoCreate, ProductoUpdate } from '@/types/producto';
import { productoService } from '@/services/productoService';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ProductoForm } from '@/components/ProductoForm';
import { ProductoList } from '@/components/ProductoList';
import { WebSocketStatus } from '@/components/WebSocketStatus';

export default function Home() {
  const [productos, setProductos] = useState<ProductoResponse[]>([]);
  const [editingProducto, setEditingProducto] = useState<ProductoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  const { isConnected, lastMessage, connect, disconnect, connectionCount, setConnectionCount } = 
    useWebSocket('ws://localhost:8000/ws');

  // Definir todas las funciones primero
  const cargarProductos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const productosData = await productoService.obtenerProductos();
      setProductos(productosData);
    } catch (err) {
      setError('Error cargando productos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarConexiones = useCallback(async () => {
    try {
      const { active_connections } = await productoService.obtenerConexiones();
      setConnectionCount(active_connections);
    } catch (err) {
      console.error('Error obteniendo conexiones:', err);
    }
  }, [setConnectionCount]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleWebSocketMessage = useCallback((message: any) => {
    const { action, producto, producto_id } = message;
    
    switch (action) {
      case 'create':
        if (producto) {
          setProductos(prev => [producto, ...prev]);
        }
        break;
        
      case 'update':
        if (producto) {
          setProductos(prev => prev.map(p => p.id === producto.id ? producto : p));
        }
        break;
        
      case 'delete':
        if (producto_id) {
          setProductos(prev => prev.filter(p => p.id !== producto_id));
        }
        break;
    }
  }, []);

  const handleCrearProducto = useCallback(async (producto: ProductoCreate) => {
    try {
      setLoading(true);
      setError(null);
      await productoService.crearProducto(producto);
      // El producto se añadirá automáticamente via WebSocket
    } catch (err) {
      setError('Error creando producto');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleActualizarProducto = useCallback(async (productoUpdate: ProductoUpdate) => {
    if (!editingProducto) return;
    
    try {
      setLoading(true);
      setError(null);
      await productoService.actualizarProducto(editingProducto.id, productoUpdate);
      setEditingProducto(null);
      // El producto se actualizará automáticamente via WebSocket
    } catch (err) {
      setError('Error actualizando producto');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [editingProducto]);

  const handleEliminarProducto = useCallback(async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    try {
      setLoading(true);
      setError(null);
      await productoService.eliminarProducto(id);
      // El producto se eliminará automáticamente via WebSocket
    } catch (err) {
      setError('Error eliminando producto');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEditarProducto = useCallback((producto: ProductoResponse) => {
    setEditingProducto(producto);
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCancelarEdicion = useCallback(() => {
    setEditingProducto(null);
  }, []);

  // Ahora los useEffect que usan las funciones
  // Verificar estado del servidor
  useEffect(() => {
    const verificarServidor = async () => {
      try {
        await productoService.verificarEstado();
        setServerStatus('connected');
      } catch (err) {
        setServerStatus('disconnected');
        console.error('Error conectando al servidor:', err);
      }
    };

    verificarServidor();
    const interval = setInterval(verificarServidor, 30000); // Verificar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Cargar productos inicial
  useEffect(() => {
    if (serverStatus === 'connected') {
      cargarProductos();
      cargarConexiones();
    }
  }, [serverStatus, cargarProductos, cargarConexiones]);

  // Escuchar cambios por WebSocket
  useEffect(() => {
    if (lastMessage) {
      handleWebSocketMessage(lastMessage);
    }
  }, [lastMessage, handleWebSocketMessage]);

  // Actualizar conexiones cuando cambie el estado del WebSocket
  useEffect(() => {
    if (isConnected && serverStatus === 'connected') {
      cargarConexiones();
    }
  }, [isConnected, serverStatus, cargarConexiones]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Productos
          </h1>
          <p className="text-gray-600">
            CRUD con actualizaciones en tiempo real via WebSocket
          </p>
        </div>

        {/* Server Status */}
        <div className={`mb-6 px-4 py-3 rounded-lg border ${
          serverStatus === 'connected' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : serverStatus === 'disconnected'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${
              serverStatus === 'connected' 
                ? 'bg-green-400' 
                : serverStatus === 'disconnected'
                ? 'bg-red-400'
                : 'bg-yellow-400 animate-pulse'
            }`}></span>
            {serverStatus === 'connected' && 'Servidor conectado'}
            {serverStatus === 'disconnected' && 'Servidor desconectado - Verifica que FastAPI esté corriendo en localhost:8000'}
            {serverStatus === 'checking' && 'Verificando conexión al servidor...'}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mb-6 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
              Procesando...
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* WebSocket Status */}
              <WebSocketStatus
                isConnected={isConnected}
                connectionCount={connectionCount}
                lastMessage={lastMessage}
                onReconnect={connect}
                onDisconnect={disconnect}
              />

              {/* Formulario */}
              <ProductoForm
                producto={editingProducto || undefined}
                onSubmit={(producto: ProductoCreate | ProductoUpdate) => {
                  if (editingProducto) {
                    return handleActualizarProducto(producto as ProductoUpdate);
                  } else {
                    return handleCrearProducto(producto as ProductoCreate);
                  }
                }}
                onCancel={handleCancelarEdicion}
                isEditing={!!editingProducto}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <ProductoList
              productos={productos}
              onEdit={handleEditarProducto}
              onDelete={handleEliminarProducto}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Backend: <code className="bg-gray-200 px-2 py-1 rounded">http://localhost:8000</code> | 
            WebSocket: <code className="bg-gray-200 px-2 py-1 rounded">ws://localhost:8000/ws</code>
          </p>
        </div>
      </div>
    </div>
  );
}
