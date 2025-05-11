const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const { log } = require('./utils');
const MenuHandler = require('./menuHandler');
const Chatbot = require('./chatbot');

// Inicializa o cliente do WhatsApp
const client = new Client();

// Inicializa o QR Code
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

// Evento de conexão bem-sucedida
client.on('ready', () => {
    log('INFO', 'WhatsApp conectado ao Supermercado Eta');
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

// Inicializa o cliente
client.initialize(); 