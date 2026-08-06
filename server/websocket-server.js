// Standalone WebSocket server for real-time patient <-> staff sync.
//
// Next.js App Router route handlers can't accept a raw WebSocket upgrade
// (no `res.socket.server` hook like the old Pages Router API routes had),
// so this runs as its own small Node process alongside `next dev`/`next start`.
// Run with: npm run ws-server
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || process.env.WS_PORT || 4001;
const HEARTBEAT_INTERVAL_MS = 30000;

const wss = new WebSocketServer({ port: PORT });

// clientId -> { ws, role }
const clients = new Map();
let nextClientId = 1;

function broadcastToStaff(message) {
  const payload = JSON.stringify(message);
  for (const client of clients.values()) {
    if (client.role === "staff" && client.ws.readyState === client.ws.OPEN) {
      client.ws.send(payload);
    }
  }
}

wss.on("connection", (ws, request) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const role = url.searchParams.get("role") === "staff" ? "staff" : "patient";

  const clientId = nextClientId++;
  clients.set(clientId, { ws, role, isAlive: true });
  console.log(`[ws-server] client ${clientId} connected as "${role}" (${clients.size} total)`);

  ws.on("pong", () => {
    const client = clients.get(clientId);
    if (client) client.isAlive = true;
  });

  ws.on("message", (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      console.warn(`[ws-server] client ${clientId} sent invalid JSON, ignoring`);
      return;
    }

    // Only patient clients broadcast form data; staff clients are read-only.
    if (role !== "patient") return;
    if (message?.type !== "update" && message?.type !== "submit") return;

    broadcastToStaff({
      type: message.type,
      data: message.data,
      timestamp: Date.now(),
    });
  });

  ws.on("close", () => {
    clients.delete(clientId);
    console.log(`[ws-server] client ${clientId} disconnected (${clients.size} total)`);
  });

  ws.on("error", (err) => {
    console.error(`[ws-server] client ${clientId} error:`, err.message);
  });
});

// Heartbeat: drop dead connections that never respond to ping.
const heartbeat = setInterval(() => {
  for (const [clientId, client] of clients.entries()) {
    if (!client.isAlive) {
      client.ws.terminate();
      clients.delete(clientId);
      continue;
    }
    client.isAlive = false;
    client.ws.ping();
  }
}, HEARTBEAT_INTERVAL_MS);

wss.on("close", () => clearInterval(heartbeat));

console.log(`[ws-server] listening on ws://localhost:${PORT}`);
