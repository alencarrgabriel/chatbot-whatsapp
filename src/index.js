const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const { log } = require('./utils');
const MenuHandler = require('./menuHandler');
const Chatbot = require('./chatbot');
const path = require('path');
const fs = require('fs');

// Verificar e criar diretório de logs se não existir
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    log('INFO', 'Diretório de logs criado', { path: logDir });
}

// Configurações do cliente WhatsApp - ajustado para garantir que o QR code funcione
const clientConfig = {
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
        headless: true
    }
};

// Inicializa o cliente do WhatsApp
const client = new Client(clientConfig);

// Inicializa o QR Code - garantindo que o console seja limpo para mostrar corretamente
client.on('qr', qr => {
    // Limpa o console para melhor visualização do QR code
    console.clear();
    console.log('Escaneie o QR Code abaixo com seu WhatsApp:');
    qrcode.generate(qr, {small: true});
    log('INFO', 'QR Code gerado e exibido no console');
});

// Evento de conexão bem-sucedida
client.on('ready', () => {
    console.clear(); // Limpa o QR code após conectar
    console.log('🟢 WhatsApp conectado ao Supermercado Eta!');
    log('INFO', 'WhatsApp conectado com sucesso');
});

// Eventos de erro e desconexão
client.on('disconnected', (reason) => {
    log('ERRO', 'Cliente desconectado', { reason });
    console.log('❌ WhatsApp desconectado. Tentando reconectar...');
    
    // Tenta reconectar após 10 segundos
    setTimeout(() => {
        log('INFO', 'Tentando reconectar...');
        client.initialize();
    }, 10000);
});

client.on('auth_failure', (error) => {
    log('ERRO', 'Falha na autenticação', { error });
    console.log('❌ Falha na autenticação do WhatsApp. Verifique o console para mais detalhes.');
});

// Inicializa o chatbot
const menuHandler = new MenuHandler(client);
const chatbot = new Chatbot(client, menuHandler);

// Processa mensagens recebidas
client.on('message', async msg => {
    try {
        await chatbot.processarMensagem(msg);
    } catch (error) {
        log('ERRO', 'Erro ao processar mensagem:', error);
    }
});

// Inicia o processo
try {
    console.log('📱 Inicializando WhatsApp...');
    console.log('⏳ Aguarde o QR Code aparecer...');
    log('INFO', 'Inicializando cliente WhatsApp...');
    client.initialize();
} catch (error) {
    log('ERRO', 'Falha ao inicializar cliente', { error });
    console.error('❌ Erro ao inicializar o WhatsApp:', error);
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    log('ERRO', 'Erro não capturado:', error);
    console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    log('ERRO', 'Promessa rejeitada não tratada:', { reason });
    console.error('❌ Promessa rejeitada não tratada:', reason);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('👋 Encerrando aplicação...');
    log('INFO', 'Encerrando aplicação...');
    try {
        await client.destroy();
        log('INFO', 'Cliente WhatsApp desconectado');
        console.log('✅ WhatsApp desconectado com sucesso');
    } catch (error) {
        log('ERRO', 'Erro ao desconectar cliente', { error });
        console.error('❌ Erro ao desconectar WhatsApp:', error);
    }
    process.exit(0);
}); 