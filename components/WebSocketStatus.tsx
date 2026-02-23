'use client';

import { ProductoWebSocketMessage } from '@/types/producto';

interface WebSocketStatusProps {
  isConnected: boolean;
  connectionCount: number;
  lastMessage: ProductoWebSocketMessage | null;
  onReconnect: () => void;
  onDisconnect: () => void;
}

export const WebSocketStatus = ({ 
  isConnected, 
  connectionCount, 
  lastMessage, 
  onReconnect, 
  onDisconnect 
}: WebSocketStatusProps) => {
  const formatLastMessage = () => {
    if (!lastMessage) return 'Sin mensajes';
    
    const { action, producto, producto_id } = lastMessage;
    const timestamp = new Date().toLocaleTimeString();
    
    switch (action) {
      case 'create':
        return `[${timestamp}] Producto creado: "${producto?.nombre}"`;
      case 'update':
        return `[${timestamp}] Producto actualizado: "${producto?.nombre}"`;
      case 'delete':
        return `[${timestamp}] Producto eliminado (ID: ${producto_id})`;
      default:
        return `[${timestamp}] Acción: ${action}`;
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${
      isConnected 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-800">Estado WebSocket</h4>
        <div className="flex gap-2">
          {isConnected ? (
            <button
              onClick={onDisconnect}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Desconectar
            </button>
          ) : (
            <button
              onClick={onReconnect}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Reconectar
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`}></span>
          <span className={isConnected ? 'text-green-700' : 'text-red-700'}>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        
        <div className="text-gray-600">
          <strong>Conexiones activas:</strong> {connectionCount}
        </div>
        
        <div className="text-gray-600">
          <strong>Último mensaje:</strong>
          <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono">
            {formatLastMessage()}
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          <strong>URL:</strong> ws://localhost:8000/ws
        </div>
      </div>
    </div>
  );
};