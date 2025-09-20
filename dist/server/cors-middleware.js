"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var cors_middleware_exports = {};
__export(cors_middleware_exports, {
  applyCorsHeaders: () => applyCorsHeaders,
  isWebSocketOriginAllowed: () => isWebSocketOriginAllowed,
  logCorsRequest: () => logCorsRequest,
  sockjsCorsOptions: () => sockjsCorsOptions
});
module.exports = __toCommonJS(cors_middleware_exports);
const CORS_CONFIG = {
  // Origens permitidas
  allowedOrigins: [
    "https://feneto7.github.io",
    "https://feneto7.github.io/ocbmon-showdown-client",
    "https://feneto7.github.io/ocbmon-showdown-client/public",
    "http://localhost:4280",
    "http://localhost:3000",
    "http://127.0.0.1:4280",
    "http://127.0.0.1:3000"
  ],
  // Métodos permitidos
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  // Headers permitidos
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
    "Sec-WebSocket-Extensions",
    "Sec-WebSocket-Key",
    "Sec-WebSocket-Protocol",
    "Sec-WebSocket-Version",
    "Upgrade",
    "Connection"
  ],
  // Permitir credenciais
  credentials: true,
  // Cache de preflight
  maxAge: 86400
  // 24 horas
};
function applyCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const isOriginAllowed = !origin || CORS_CONFIG.allowedOrigins.includes(origin) || CORS_CONFIG.allowedOrigins.some((allowed) => origin.startsWith(allowed));
  if (isOriginAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Methods", CORS_CONFIG.allowedMethods.join(", "));
    res.setHeader("Access-Control-Allow-Headers", CORS_CONFIG.allowedHeaders.join(", "));
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", CORS_CONFIG.maxAge.toString());
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
  }
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return true;
  }
  return false;
}
function isWebSocketOriginAllowed(origin) {
  if (!origin)
    return true;
  return CORS_CONFIG.allowedOrigins.includes(origin) || CORS_CONFIG.allowedOrigins.some((allowed) => origin.startsWith(allowed));
}
const sockjsCorsOptions = {
  origin: "*:*",
  websocket: true,
  heartbeat_delay: 25e3,
  disconnect_delay: 5e3,
  sockjs_url: "https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js",
  log: (severity, message) => {
    if (Config.debugsockets) {
      console.log(`SockJS ${severity}: ${message}`);
    }
  }
};
function logCorsRequest(req, allowed) {
  if (Config.debugsockets) {
    const origin = req.headers.origin;
    const method = req.method;
    const url = req.url;
    console.log(`CORS ${allowed ? "ALLOWED" : "BLOCKED"}: ${method} ${url} from ${origin || "unknown origin"}`);
  }
}
//# sourceMappingURL=cors-middleware.js.map
