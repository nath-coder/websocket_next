'use client';

import { useState, useEffect, useRef } from 'react';

export default function TestWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connectionUrl, setConnectionUrl] = useState('ws://localhost:8000/ws');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connect = () => {
    if (socket) {
      socket.close();
    }

    try {
      const ws = new WebSocket(connectionUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        setSocket(ws);
        addMessage('🟢 Conectado al WebSocket');
      };
      
      ws.onmessage = (event) => {
        let messageData;
        try {
          messageData = JSON.parse(event.data);
          addMessage(`📨 ${JSON.stringify(messageData, null, 2)}`);
        } catch {
          addMessage(`📨 ${event.data}`);
        }
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        setSocket(null);
        addMessage('🔴 Desconectado del WebSocket');
      };
      
      ws.onerror = (error) => {
        addMessage(`❌ Error: ${error}`);
      };
      
    } catch (error) {
      addMessage(`❌ Error conectando: ${error}`);
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.close();
    }
  };

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN && inputMessage.trim()) {
      socket.send(inputMessage);
      addMessage(`📤 Enviado: ${inputMessage}`);
      setInputMessage('');
    }
  };

  const addMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const testProductActions = () => {
    const testMessages = [
      'Conectando para probar notificaciones de productos...',
      'Listo para recibir actualizaciones en tiempo real'
    ];
    
    testMessages.forEach((msg, index) => {
      setTimeout(() => addMessage(`🧪 ${msg}`), index * 500);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">Test WebSocket</h1>
            <p className="text-blue-100">
              Prueba de conexión WebSocket para el sistema de productos
            </p>
          </div>

          {/* Connection Controls */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del WebSocket
                </label>
                <input
                  type="text"
                  value={connectionUrl}
                  onChange={(e) => setConnectionUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ws://localhost:8000/ws"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={isConnected ? disconnect : connect}
                  className={`px-4 py-2 rounded-md font-medium ${
                    isConnected 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isConnected ? 'Desconectar' : 'Conectar'}
                </button>
                
                <button
                  onClick={testProductActions}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
                >
                  Test Productos
                </button>
                
                <button
                  onClick={clearMessages}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium"
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="mt-4 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`font-medium ${
                isConnected ? 'text-green-700' : 'text-red-700'
              }`}>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Mensajes</h3>
            
            <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-gray-500">No hay mensajes aún...</div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className="mb-1 overflow-wrap-break-word">
                    {message}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Send Message */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isConnected}
              />
              <button
                onClick={sendMessage}
                disabled={!isConnected || !inputMessage.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Enviar
              </button>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Instrucciones:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Conecta al WebSocket del backend de productos</li>
                <li>Los mensajes de productos aparecerán automáticamente</li>
                <li>Puedes enviar mensajes de prueba</li>
                <li>Ve a la aplicación principal para crear/editar productos y ver las notificaciones aquí</li>
              </ul>
            </div>
          </div>
        </div>

        {/* API Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Información de la API</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>WebSocket:</strong>
              <code className="block bg-gray-100 p-2 rounded mt-1">ws://localhost:8000/ws</code>
            </div>
            <div>
              <strong>API REST:</strong>
              <code className="block bg-gray-100 p-2 rounded mt-1">http://localhost:8000</code>
            </div>
            <div>
              <strong>Documentación:</strong>
              <code className="block bg-gray-100 p-2 rounded mt-1">http://localhost:8000/docs</code>
            </div>
            <div>
              <strong>Frontend Principal:</strong>
              <code className="block bg-gray-100 p-2 rounded mt-1">http://localhost:3000</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}