// Script para corrigir problemas de conexão no GitHub Pages
(function() {
    'use strict';
    
    // Aguarda o carregamento completo da página
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Script de correção de conexão carregado');
        
        // Verifica se o app foi inicializado
        var checkAppInitialization = setInterval(function() {
            if (window.app && window.app.connection) {
                clearInterval(checkAppInitialization);
                console.log('App inicializado, configurando conexão...');
                
                // Configura timeout para reconexão
                var originalConnect = window.app.connection.connect;
                if (originalConnect) {
                    window.app.connection.connect = function() {
                        console.log('Tentando conectar ao servidor...');
                        return originalConnect.call(this);
                    };
                }
                
                // Configura tratamento de erros de conexão
                window.app.connection.on('connect', function() {
                    console.log('Conectado ao servidor com sucesso');
                });
                
                window.app.connection.on('error', function(error) {
                    console.log('Erro de conexão:', error);
                    // Tenta reconectar após 5 segundos
                    setTimeout(function() {
                        console.log('Tentando reconectar...');
                        if (window.app && window.app.connection) {
                            window.app.connection.connect();
                        }
                    }, 5000);
                });
                
                window.app.connection.on('disconnect', function() {
                    console.log('Desconectado do servidor');
                    // Tenta reconectar após 3 segundos
                    setTimeout(function() {
                        console.log('Tentando reconectar após desconexão...');
                        if (window.app && window.app.connection) {
                            window.app.connection.connect();
                        }
                    }, 3000);
                });
            }
        }, 100);
        
        // Limpa o intervalo após 30 segundos
        setTimeout(function() {
            clearInterval(checkAppInitialization);
        }, 30000);
    });
    
    // Função auxiliar para verificar conectividade
    function checkServerConnectivity() {
        return new Promise(function(resolve, reject) {
            var server = Config.defaultserver || Config.server;
            if (!server) {
                reject('Nenhuma configuração de servidor encontrada');
                return;
            }
            
            var protocol = server.https ? 'https' : 'http';
            var url = protocol + '://' + server.host + ':' + server.port;
            
            // Testa conectividade básica
            var img = new Image();
            img.onload = function() {
                resolve('Servidor acessível');
            };
            img.onerror = function() {
                reject('Servidor inacessível');
            };
            img.src = url + '/favicon.ico?' + Date.now();
        });
    }
    
    // Verifica conectividade do servidor
    setTimeout(function() {
        checkServerConnectivity().then(function(result) {
            console.log('Verificação de conectividade:', result);
        }).catch(function(error) {
            console.log('Problema de conectividade:', error);
        });
    }, 2000);
})();
