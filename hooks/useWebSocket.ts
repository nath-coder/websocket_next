'use client';

import { useEffect, useState, useRef } from 'react';
import { ProductoWebSocketMessage } from '@/types/producto';

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<ProductoWebSocketMessage | null>(null);
  const [connectionCount, setConnectionCount] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const wsRef = useRef<WebSocket | null>(null);

  const createWebSocketConnection = (socketUrl: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      console.log('Intentando conectar a:', socketUrl);
      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket conectado exitosamente');
        setIsConnected(true);
        setSocket(ws);
        reconnectAttempts.current = 0;
      };
      
      ws.onmessage = (event) => {
        try {
          const data: ProductoWebSocketMessage = JSON.parse(event.data);
          setLastMessage(data);
          console.log('Mensaje recibido:', data);
        } catch (error) {
          console.error('Error parseando mensaje:', error);
        }
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket desconectado. Código:', event.code, 'Razón:', event.reason);
        setIsConnected(false);
        setSocket(null);
        
        // Intentar reconectar solo si no es un cierre intencional
        if (reconnectAttempts.current < maxReconnectAttempts && event.code !== 1000) {
          reconnectAttempts.current++;
          const delay = Math.min(Math.pow(2, reconnectAttempts.current) * 1000, 30000);
          console.log(`Intentando reconectar en ${delay}ms... Intento ${reconnectAttempts.current}/${maxReconnectAttempts}`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            createWebSocketConnection(socketUrl);
          }, delay);
        }
      };
      
      ws.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        setIsConnected(false);
        setSocket(null);
      };
      
    } catch (error) {
      console.error('Error creando conexión WebSocket:', error);
      setIsConnected(false);
    }
  };

  const connect = () => {
    // Limpiar intentos previos
    reconnectAttempts.current = 0;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    createWebSocketConnection(url);
  };

  const disconnect = () => {
    // Limpiar timeout de reconexión
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Establecer máximo de intentos para prevenir reconexión automática
    reconnectAttempts.current = maxReconnectAttempts;
    
    // Cerrar conexión WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, 'Desconexión intencional');
    }
    
    setSocket(null);
    setIsConnected(false);
  };

  const sendMessage = (message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      console.warn('WebSocket no está conectado. Mensaje no enviado:', message);
    }
  };

  // Inicializar conexión automáticamente
  useEffect(() => {
    let isMounted = true;
    
    if (isMounted && url) {
      createWebSocketConnection(url);
    }
    
    return () => {
      isMounted = false;
      
      // Limpiar timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Cerrar conexión
      if (wsRef.current) {
        wsRef.current.close(1000, 'Componente desmontado');
      }
    };
  }, [url]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    connectionCount,
    setConnectionCount
  };
};