#!/usr/bin/env node
/**
 * Script para garantir que os arquivos de log existam
 * Necessário para o Render que não tem os arquivos criados automaticamente
 */

const fs = require('fs');
const path = require('path');

// Caminho para a pasta de logs
const logsDir = path.join(__dirname, '..', 'logs');

// Arquivos de log necessários
const logFiles = [
    'chatlog-access.txt',
    'responder.jsonl',
    'errors.txt'
];

// Criar pasta de logs se não existir
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('Criada pasta de logs:', logsDir);
}

// Criar arquivos de log se não existirem
logFiles.forEach(file => {
    const filePath = path.join(logsDir, file);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '');
        console.log('Criado arquivo de log:', file);
    }
});

console.log('Todos os arquivos de log estão prontos!');
