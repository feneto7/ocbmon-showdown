#!/usr/bin/env node
/**
 * Script de inicialização específico para Render
 * Otimizado para limitações de memória e ambiente cloud
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Iniciando OCBmon Showdown no Render...');

// 1. Garantir que arquivos de log existam
function ensureLogFiles() {
    const logFiles = [
        'logs/chatlog-access.txt',
        'logs/responder.jsonl', 
        'logs/errors.txt'
    ];

    // Criar pasta logs se não existir
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
        console.log('✓ Pasta de logs criada');
    }

    // Criar arquivos de log se não existirem
    logFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '');
            console.log(`✓ Arquivo de log criado: ${file}`);
        }
    });
}

// 2. Configurar variáveis de ambiente para otimização
process.env.NODE_OPTIONS = '--max-old-space-size=350 --optimize-for-size'; // Limitar uso de memória a 350MB
process.env.NODE_ENV = 'production';
process.env.GC_FORCE = 'true'; // Forçar garbage collection
process.env.NODE_NO_WARNINGS = '1'; // Reduzir warnings

// 3. Garantir logs
ensureLogFiles();

// 4. Iniciar servidor com monitoramento de memória
console.log('📊 Configurações de memória:');
console.log(`  - Limite de memória: ${process.env.NODE_OPTIONS}`);
console.log(`  - Ambiente: ${process.env.NODE_ENV}`);

// 5. Iniciar o servidor
const serverProcess = spawn('node', ['pokemon-showdown', 'start'], {
    stdio: 'inherit',
    env: process.env
});

// 6. Monitorar uso de memória
setInterval(() => {
    const memUsage = process.memoryUsage();
    const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    console.log(`📊 Uso de memória: ${memMB}MB`);
    
    if (memMB > 300) {
        console.warn('⚠️  Alto uso de memória detectado!');
    }
    
    if (memMB > 350) {
        console.error('🚨 CRÍTICO: Uso de memória muito alto!');
        // Forçar garbage collection
        if (global.gc) {
            global.gc();
        }
    }
}, 30000); // A cada 30 segundos

serverProcess.on('close', (code) => {
    console.log(`🛑 Servidor encerrado com código: ${code}`);
});

serverProcess.on('error', (error) => {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
});
