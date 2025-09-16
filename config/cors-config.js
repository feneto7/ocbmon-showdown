// Configuração de CORS para permitir GitHub Pages
'use strict';

/**
 * Configuração de CORS para Pokemon Showdown
 * Permite conexões do GitHub Pages para o servidor no Render
 */

exports.corsOptions = {
	// Origens permitidas para conexão
	origin: [
		'https://feneto7.github.io',
		'https://feneto7.github.io/ocbmon-showdown-client',
		'https://feneto7.github.io/ocbmon-showdown-client/public',
		'http://localhost:4280', // Para desenvolvimento local
		'http://localhost:3000',
		'http://127.0.0.1:4280',
		'http://127.0.0.1:3000'
	],
	
	// Métodos permitidos
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	
	// Headers permitidos
	allowedHeaders: [
		'Content-Type',
		'Authorization',
		'X-Requested-With',
		'Accept',
		'Origin',
		'Access-Control-Request-Method',
		'Access-Control-Request-Headers'
	],
	
	// Permitir cookies/credenciais
	credentials: true,
	
	// Cache de preflight
	maxAge: 86400, // 24 horas
};

/**
 * Configuração de WebSocket CORS
 */
exports.websocketOrigins = [
	'https://feneto7.github.io',
	'https://feneto7.github.io/ocbmon-showdown-client',
	'https://feneto7.github.io/ocbmon-showdown-client/public',
	'http://localhost:4280',
	'http://localhost:3000',
	'http://127.0.0.1:4280',
	'http://127.0.0.1:3000'
];

/**
 * Headers de segurança para GitHub Pages
 */
exports.securityHeaders = {
	'Access-Control-Allow-Origin': 'https://feneto7.github.io',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
	'Access-Control-Allow-Credentials': 'true',
	'Access-Control-Max-Age': '86400',
	'X-Frame-Options': 'SAMEORIGIN',
	'X-Content-Type-Options': 'nosniff',
	'X-XSS-Protection': '1; mode=block'
};
