'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, refreshUser } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Robust persistent toast with custom close button
  const showPersistentToast = (message: string, icon?: string, style?: any) => {
    toast((t) => (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        minWidth: '300px'
      }}>
        <span style={{ fontSize: '1.2rem' }}>{icon || '🔔'}</span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{message}</p>
        </div>
        <button 
          onClick={() => toast.dismiss(t.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}
        >
          <X size={18} />
        </button>
      </div>
    ), {
      duration: Infinity, // Stay until manually closed
      position: 'top-right',
      style: {
        background: '#fff',
        color: '#000',
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        border: '1px solid #eee',
        ...style
      }
    });
  };

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    console.log(`[Socket] Attempting connection to ${SOCKET_URL}/notifications...`);
    
    const newSocket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      path: '/socket.io',
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Successfully connected! ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('connect_error', (err) => {
      console.error('[Socket] Connection Error Details:', err.message);
      setIsConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected. Reason:', reason);
      setIsConnected(false);
    });

    // Handle Sale Notifications
    newSocket.on('saleStarted', (data) => {
      const productName = data.data?.productName || data.productName || 'Product';
      const salePrice = data.data?.salePrice || data.salePrice || '0';
      showPersistentToast(`🔥 FLASH SALE: ${productName} at $${salePrice}!`, '🔥');
    });

    // Handle Order Notifications
    newSocket.on('orderNotification', (data) => {
      showPersistentToast(data.message, '🛍️', { borderBottom: '3px solid #000' });
    });

    // Handle Loyalty Points Notifications
    newSocket.on('pointsNotification', (data) => {
      console.log('[Socket] Points update received:', data);
      showPersistentToast(data.message, '🌟');
      // Refresh user data with a slight delay to ensure DB consistency
      setTimeout(() => {
        console.log('[Socket] Triggering profile refresh for points update...');
        refreshUser();
      }, 1500); // 1.5s delay to allow DB transaction to be fully visible
    });

    // Handle General/Review Notifications
    newSocket.on('notification', (data) => {
      showPersistentToast(data.message, '🔔');
    });

    // Catch-all debug logger
    newSocket.onAny((eventName, ...args) => {
      console.log(`[Socket] Incoming Event: ${eventName}`, args);
    });

    setSocket(newSocket);

    return () => {
      console.log('[Socket] Cleaning up connection...');
      newSocket.close();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
