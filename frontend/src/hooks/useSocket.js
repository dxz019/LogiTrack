// Socket hook - manages Socket.io connection
// Provides emit/on methods for real-time communication

import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

let socket = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { accessToken } = useAuthStore();

  // Initialize socket when user is authenticated
  useEffect(() => {
    if (accessToken && !socket) {
      socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: { token: accessToken }
      });

      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [accessToken]);

  // Emit event to server
  const emit = useCallback((event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  }, [isConnected]);

  // Listen for server events
  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, []);

  return { socket, isConnected, emit, on };
};

export default useSocket;