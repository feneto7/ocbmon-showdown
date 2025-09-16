/**
 * CORS Middleware para Pokemon Showdown
 * Permite conexões do GitHub Pages para o servidor no Render
 */

import * as http from 'http';

// Configuração de CORS
const CORS_CONFIG = {
	// Origens permitidas
	allowedOrigins: [
		'https://feneto7.github.io',
		'https://feneto7.github.io/ocbmon-showdown-client',
		'https://feneto7.github.io/ocbmon-showdown-client/public',
		'http://localhost:4280',
		'http://localhost:3000',
		'http://127.0.0.1:4280',
		'http://127.0.0.1:3000'
	],
	
	// Métodos permitidos
	allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	
	// Headers permitidos
	allowedHeaders: [
		'Content-Type',
		'Authorization',
		'X-Requested-With',
		'Accept',
		'Origin',
		'Access-Control-Request-Method',
		'Access-Control-Request-Headers',
		'Sec-WebSocket-Extensions',
		'Sec-WebSocket-Key',
		'Sec-WebSocket-Protocol',
		'Sec-WebSocket-Version',
		'Upgrade',
		'Connection'
	],
	
	// Permitir credenciais
	credentials: true,
	
	// Cache de preflight
	maxAge: 86400 // 24 horas
};

/**
 * Middleware CORS para requisições HTTP
 */
export function applyCorsHeaders(req: http.IncomingMessage, res: http.ServerResponse): boolean {
	const origin = req.headers.origin as string;
	
	// Verifica se a origem é permitida
	const isOriginAllowed = !origin || 
		CORS_CONFIG.allowedOrigins.includes(origin) || 
		CORS_CONFIG.allowedOrigins.some(allowed => origin.startsWith(allowed));
	
	if (isOriginAllowed) {
		// Aplica headers CORS
		res.setHeader('Access-Control-Allow-Origin', origin || '*');
		res.setHeader('Access-Control-Allow-Methods', CORS_CONFIG.allowedMethods.join(', '));
		res.setHeader('Access-Control-Allow-Headers', CORS_CONFIG.allowedHeaders.join(', '));
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		res.setHeader('Access-Control-Max-Age', CORS_CONFIG.maxAge.toString());
		
		// Headers de segurança adicionais
		res.setHeader('X-Frame-Options', 'SAMEORIGIN');
		res.setHeader('X-Content-Type-Options', 'nosniff');
		res.setHeader('X-XSS-Protection', '1; mode=block');
	}
	
	// Responde a requisições OPTIONS (preflight)
	if (req.method === 'OPTIONS') {
		res.writeHead(200);
		res.end();
		return true;
	}
	
	return false;
}

/**
 * Verifica se uma origem WebSocket é permitida
 */
export function isWebSocketOriginAllowed(origin?: string): boolean {
	if (!origin) return true; // Permite conexões sem origem (desenvolvimento local)
	
	return CORS_CONFIG.allowedOrigins.includes(origin) || 
		   CORS_CONFIG.allowedOrigins.some(allowed => origin.startsWith(allowed));
}

/**
 * Configuração de CORS para SockJS
 */
export const sockjsCorsOptions = {
	origin: '*:*',
	websocket: true,
	heartbeat_delay: 25000,
	disconnect_delay: 5000,
	sockjs_url: 'https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js',
	log: (severity: string, message: string) => {
		if (Config.debugsockets) {
			console.log(`SockJS ${severity}: ${message}`);
		}
	}
};

/**
 * Log de conexões CORS para debugging
 */
export function logCorsRequest(req: http.IncomingMessage, allowed: boolean): void {
	if (Config.debugsockets) {
		const origin = req.headers.origin;
		const method = req.method;
		const url = req.url;
		
		console.log(`CORS ${allowed ? 'ALLOWED' : 'BLOCKED'}: ${method} ${url} from ${origin || 'unknown origin'}`);
	}
}
