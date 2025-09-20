/**
 * Inicialização de logs para o servidor
 * Executado automaticamente quando o servidor inicia
 */

const fs = require('fs');
const path = require('path');

function ensureLogFiles() {
    const logFiles = [
        'logs/chatlog-access.txt',
        'logs/responder.jsonl', 
        'logs/errors.txt'
    ];

    // Criar pasta logs se não existir
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
        try {
            fs.mkdirSync(logsDir, { recursive: true });
            console.log('✓ Pasta de logs criada:', logsDir);
        } catch (error) {
            console.error('✗ Erro ao criar pasta de logs:', error.message);
        }
    }

    // Criar arquivos de log se não existirem
    logFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (!fs.existsSync(filePath)) {
            try {
                fs.writeFileSync(filePath, '');
                console.log('✓ Arquivo de log criado:', file);
            } catch (error) {
                console.error('✗ Erro ao criar arquivo de log:', file, error.message);
            }
        }
    });
}

// Executar se chamado diretamente
if (require.main === module) {
    ensureLogFiles();
}

module.exports = { ensureLogFiles };
