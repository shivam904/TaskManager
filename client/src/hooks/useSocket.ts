import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { initializeSocket, disconnectSocket } from '../utils/socket';
import { fetchAllTasks } from '../store/slices/taskSlice';

type UseSocketOptions = {
  autoConnect?: boolean;
  autoDisconnect?: boolean;
};

const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = true, autoDisconnect = true } = options;
  const socket = useRef<Socket | null>(null);
  const dispatch = useDispatch<any>();

  useEffect(() => {
    if (autoConnect) {
      socket.current = initializeSocket();

      // Listen for task updates
      socket.current.on('taskUpdated', (data) => {
        console.log('Task updated:', data);
        // Refresh tasks when an update is received
        dispatch(fetchAllTasks());
      });
    }

    return () => {
      if (autoDisconnect && socket.current) {
        socket.current.off('taskUpdated');
        disconnectSocket();
      }
    };
  }, [autoConnect, autoDisconnect, dispatch]);

  return socket.current;
};

export default useSocket; 