#!/usr/bin/env node
/**
 * Script para garantir que os arquivos de log existam
 * Necessário para o Render que não tem os arquivos criados automaticamente
 */

const fs = require('fs');
const path = require('path');

// Caminho para a pasta de logs - tentar múltiplos caminhos
const possibleLogsDirs = [
    path.join(__dirname, '..', 'logs'),
    path.join(process.cwd(), 'logs'),
    '/opt/render/project/src/logs',
    './logs'
];

let logsDir = null;
for (const dir of possibleLogsDirs) {
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log('Criada pasta de logs:', dir);
        }
        logsDir = dir;
        break;
    } catch (error) {
        console.log('Tentando próximo caminho para logs...');
    }
}

if (!logsDir) {
    console.error('Não foi possível criar pasta de logs!');
    process.exit(1);
}

// Arquivos de log necessários
const logFiles = [
    'chatlog-access.txt',
    'responder.jsonl',
    'errors.txt'
];

// Criar arquivos de log se não existirem
logFiles.forEach(file => {
    const filePath = path.join(logsDir, file);
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '');
            console.log('Criado arquivo de log:', file);
        } else {
            console.log('Arquivo de log já existe:', file);
        }
    } catch (error) {
        console.error('Erro ao criar arquivo de log:', file, error.message);
    }
});

console.log('Todos os arquivos de log estão prontos!');
console.log('Pasta de logs:', logsDir);
