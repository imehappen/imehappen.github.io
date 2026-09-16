/**
 * Custom Next.js + Socket.IO server.
 *
 * Why a custom server? Next.js alone cannot attach WebSocket servers.
 * Socket.IO is FULLY SET UP here but intentionally UNUSED for app logic yet
 * (see README → "Socket.IO (prepared)"). The `io` instance is exposed on
 * globalThis so API routes can emit events the moment you start using it:
 *
 *   const io = globalThis.__io?.io;
 *   io?.emit("order:created", { orderNumber: "ORD-..." });
 *
 * Run with:  npm run dev   (development)
 *            npm start     (production, after `npm run build`)
 */
const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

if (!globalThis.__io) {
  globalThis.__io = { io: null };
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new Server(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN
        ? process.env.SOCKET_CORS_ORIGIN.split(",").map((s) => s.trim())
        : undefined,
      methods: ["GET", "POST"],
    },
  });

  globalThis.__io.io = io;

  io.on("connection", (socket) => {
    console.log(`[socket.io] client connected: ${socket.id}`);

    // ── Reserved for future real-time features ────────────────────────
    // socket.on("order:track", (orderNumber) => { ... });
    // socket.join(`order:${orderNumber}`);

    socket.on("disconnect", (reason) => {
      console.log(`[socket.io] client disconnected: ${socket.id} (${reason})`);
    });
  });

  httpServer.once("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    const displayHost = hostname === "0.0.0.0" ? "localhost" : hostname;
    console.log(
      `> Ready on http://${displayHost}:${port} (${dev ? "development" : "production"})`
    );
    console.log("> Socket.IO listening on /api/socketio (prepared — no events in use yet)");
  });
});
