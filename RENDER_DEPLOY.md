# Deploy Completo no Render (Cliente + Servidor)

## 🔧 **Opção Alternativa: Hospedar Tudo no Render**

Se o problema de CORS persistir, você pode hospedar tanto o cliente quanto o servidor no mesmo domínio do Render.

### **Passos:**

1. **Copiar arquivos do cliente para o servidor:**
   ```bash
   # Na pasta ocbmon-showdown, criar pasta public
   mkdir public
   
   # Copiar arquivos do cliente
   cp -r ../ocbmon-showdown-client/public/* ./public/
   ```

2. **Configurar servidor para servir arquivos estáticos:**
   - Modificar `server/index.ts` para servir arquivos estáticos
   - Adicionar middleware para servir `/public/`

3. **Atualizar configurações:**
   - Cliente e servidor no mesmo domínio: `ocbmon-showdown.onrender.com`
   - Sem problemas de CORS
   - WebSocket funciona nativamente

### **Vantagens:**
- ✅ Sem problemas de CORS
- ✅ WebSocket funciona perfeitamente  
- ✅ Tudo em um só lugar
- ✅ Mais fácil de manter

### **Desvantagens:**
- ❌ Não usa GitHub Pages
- ❌ Precisa rebuild quando atualizar cliente

## 🚀 **Deploy Automático**

O servidor no Render vai fazer redeploy automaticamente quando você fizer push das mudanças.

### **URLs após deploy:**
- **Servidor:** `https://ocbmon-showdown.onrender.com`
- **Cliente (se hospedar junto):** `https://ocbmon-showdown.onrender.com/public/`
- **WebSocket:** `wss://ocbmon-showdown.onrender.com`

## 🔍 **Verificação**

1. Aguarde o Render fazer deploy (5-10 minutos)
2. Teste a conexão WebSocket
3. Verifique se os formatos carregam
4. Teste uma batalha

Se ainda não funcionar, use a **Opção Alternativa** acima.

