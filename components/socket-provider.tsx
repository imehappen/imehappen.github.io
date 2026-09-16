"use client";

/**
 * Socket.IO client provider — PREPARED BUT NOT USED for app logic yet.
 *
 * Connects to the custom server's Socket.IO endpoint and exposes a typed
 * client via `useSocket()`. Nothing in the UI currently calls it; wire
 * real-time features (order tracking, live chat, notifications) here later.
 *
 * Set NEXT_PUBLIC_SOCKET_ENABLED=false to disable the connection entirely.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false });

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SOCKET_ENABLED === "false") return;

    // Custom server mounts Socket.IO at /api/socketio on the same origin.
    const instance = io({ path: "/api/socketio", transports: ["websocket", "polling"] });

    instance.on("connect", () => setConnected(true));
    instance.on("disconnect", () => setConnected(false));

    setSocket(instance);
    return () => {
      instance.removeAllListeners();
      instance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}
