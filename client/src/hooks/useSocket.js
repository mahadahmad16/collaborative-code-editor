import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket} from "../services/socket";

const useSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setSocket(null);
      setConnected(false);
      return;
    }

    const socketInstance = connectSocket(token);

    const handleConnect = () => {
      setConnected(true);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);

    setSocket(socketInstance);
    setConnected(socketInstance.connected);

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
    };
  }, [token]);

  return {
    socket,
    connected,
  };
};

export default useSocket;