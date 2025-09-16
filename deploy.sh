#!/bin/bash

# Script para deploy automático do OCBmon Showdown
# Atualiza servidor e cliente automaticamente

echo "🚀 Iniciando deploy do OCBmon Showdown..."

# 1. Atualizar servidor
echo "📦 Atualizando servidor..."
git add .
git commit -m "Server update - $(date)"
git push

echo "✅ Servidor atualizado!"

# 2. Aguardar um pouco para o servidor processar
echo "⏳ Aguardando 30 segundos..."
sleep 30

# 3. Atualizar cliente
echo "🎮 Atualizando cliente..."
cd ../ocbmon-showdown-client
node build-server

# 4. Commit e push do cliente
git add .
git commit -m "Client update from server changes - $(date)"
git push

echo "✅ Cliente atualizado!"
echo "🎉 Deploy completo!"
echo "🌐 Cliente: https://feneto7.github.io/ocbmon-showdown-client/"
echo "🖥️ Servidor: https://ocbmon-showdown.onrender.com"
