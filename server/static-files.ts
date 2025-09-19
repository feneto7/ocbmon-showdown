/**
 * Servidor de Arquivos Estáticos
 * Serve o cliente Pokemon Showdown junto com o servidor
 */

import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const MIME_TYPES: {[key: string]: string} = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.gif': 'image/gif',
	'.ico': 'image/x-icon',
	'.svg': 'image/svg+xml',
	'.mp3': 'audio/mpeg',
	'.wav': 'audio/wav',
	'.ttf': 'font/ttf',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2'
};

/**
 * Serve arquivos estáticos do cliente
 */
export function serveStaticFile(req: http.IncomingMessage, res: http.ServerResponse): boolean {
	const parsedUrl = url.parse(req.url || '');
	let pathname = parsedUrl.pathname || '/';
	
	// Redireciona raiz para index.html da pasta public
	if (pathname === '/') {
		return serveFile(req, res, '/public/index.html');
	}
	
	// Serve arquivos do cliente
	if (pathname.startsWith('/client/')) {
		// Remove /client/ e adiciona /public/client/
		const clientPath = pathname.replace('/client/', '/public/client/');
		return serveFile(req, res, clientPath);
	}
	
	// Serve arquivos públicos diretamente
	if (pathname.startsWith('/public/')) {
		return serveFile(req, res, pathname);
	}
	
	// Tratamento específico para favicon
	if (pathname === '/favicon.ico' || pathname.includes('favicon')) {
		return serveFile(req, res, '/public/favicon.ico');
	}
	
	// Para outros caminhos, tenta servir da pasta public
	return serveFile(req, res, '/public' + pathname);
}

/**
 * Serve um arquivo específico
 */
function serveFile(req: http.IncomingMessage, res: http.ServerResponse, pathname: string): boolean {
	try {
		// Remove query parameters
		const cleanPath = pathname.split('?')[0];
		
		// Previne directory traversal
		const safePath = path.normalize(cleanPath).replace(/^(\.\.[\/\\])+/, '');
		
		// Caminho completo do arquivo
		const filePath = path.join(__dirname, '..', safePath);
		
		// Log do caminho completo para debug
		console.log(`Caminho completo: ${filePath}`);
		
		// Log para debug
		console.log(`Tentando servir: ${pathname} -> ${filePath}`);
		
		// Log específico para favicon
		if (pathname.includes('favicon')) {
			console.log(`Favicon request: ${pathname}, file exists: ${fs.existsSync(filePath)}`);
		}
		
		// Se é um diretório, tenta servir index.html
		if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
			console.log(`Diretório encontrado, tentando index.html: ${filePath}`);
			return serveFile(req, res, path.join(safePath, 'index.html'));
		}
		
		// Verifica se o arquivo existe
		if (!fs.existsSync(filePath)) {
			console.log(`Arquivo não encontrado: ${filePath}`);
			return false;
		}
		
		// Determina o content-type
		const ext = path.extname(filePath).toLowerCase();
		const contentType = MIME_TYPES[ext] || 'application/octet-stream';
		
		// Lê e serve o arquivo
		const content = fs.readFileSync(filePath);
		
		res.writeHead(200, {
			'Content-Type': contentType,
			'Content-Length': content.length,
			'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
		});
		
		res.end(content);
		return true;
		
	} catch (error) {
		console.error('Erro ao servir arquivo:', error);
		return false;
	}
}

/**
 * Middleware para arquivos estáticos
 */
export function staticFileMiddleware(req: http.IncomingMessage, res: http.ServerResponse, next: () => void): void {
	if (!serveStaticFile(req, res)) {
		next();
	}
}
