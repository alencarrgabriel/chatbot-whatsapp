const { MessageMedia } = require('whatsapp-web.js');
const path = require('path');
const fs = require('fs');
const { 
    MENU_PRINCIPAL, 
    MENSAGEM_GRUPO_OFERTAS, 
    LINKS, 
    MENSAGENS_ERRO 
} = require('./constants');
const { sendMessageWithTyping, log } = require('./utils');

class MenuHandler {
    constructor(client) {
        this.client = client;
    }

    // Mostra o menu principal
    async mostrarMenu(msg, name) {
        await sendMessageWithTyping(this.client, await msg.getChat(), msg.from, MENU_PRINCIPAL(name));
    }

    // Opção 1 - Fazer pedido
    async iniciarPedido(msg, chat) {
        // Implementado no chatbot.js
        return true;
    }

    // Opção 2 - Enviar currículo
    async enviarCurriculo(msg, chat) {
        await sendMessageWithTyping(this.client, chat, msg.from, 
            `Que bom que você tem interesse em trabalhar conosco! 😊

Para enviar seu currículo, por favor, mande um e-mail para: ${LINKS.EMAIL_CURRICULO}

Boa sorte! 🤞${MENSAGEM_GRUPO_OFERTAS}`
        );
        await this.mostrarMenu(msg, (await msg.getContact()).pushname || "Cliente");
        return true;
    }

    // Opção 3 - Grupo de promoções
    async grupoPromocoes(msg, chat) {
        await sendMessageWithTyping(this.client, chat, msg.from, 
            `Oba! 🎉 Fique por dentro de todas as nossas promoções fresquinhas!

Clique no link abaixo para entrar no nosso grupo de promoções do WhatsApp:
${LINKS.GRUPO_PROMOCOES}

Esperamos você lá! 😉`
        );
        await this.mostrarMenu(msg, (await msg.getContact()).pushname || "Cliente");
        return true;
    }

    // Opção 4 - Falar com equipe
    async falarComEquipe(msg, chat) {
        await sendMessageWithTyping(this.client, chat, msg.from, 
            `Para falar com nossa equipe, você pode:
📞 Ligar para: ${LINKS.TELEFONE} durante nosso horário comercial:
   • Segunda a Sábado: 7h às 21h
   • Domingo: 7h às 14h
   
💬 Ou, se preferir, aguarde um momento que logo um de nossos atendentes irá te responder por aqui no WhatsApp.

Por favor, nos diga como podemos te ajudar.${MENSAGEM_GRUPO_OFERTAS}`
        );
        await this.mostrarMenu(msg, (await msg.getContact()).pushname || "Cliente");
        return true;
    }

    // Opção 5 - Ver tabloide
    async verTabloide(msg, chat) {
        try {
            const tabloidePath = path.join(__dirname, '..', 'tabloide.png');
            
            if (fs.existsSync(tabloidePath)) {
                const media = MessageMedia.fromFilePath(tabloidePath);
                
                await sendMessageWithTyping(this.client, chat, msg.from, 
                    `Confira nossas ofertas incríveis no tabloide desta semana! 📰✨

Boas compras! 🛍️${MENSAGEM_GRUPO_OFERTAS}`
                );
                
                await this.client.sendMessage(msg.from, media, {caption: 'Tabloide de ofertas do Supermercado Eta! 🛒'});
            } else {
                await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_ERRO.TABLOIDE_INDISPONIVEL);
            }
        } catch (error) {
            log('ERRO', 'Erro ao enviar tabloide:', error);
            await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_ERRO.TABLOIDE_INDISPONIVEL);
        }
        
        await this.mostrarMenu(msg, (await msg.getContact()).pushname || "Cliente");
        return true;
    }

    // Opção 6 - Horário de funcionamento
    async horarioFuncionamento(msg, chat) {
        await sendMessageWithTyping(this.client, chat, msg.from, 
            `📅 Horário de Funcionamento do Supermercado Eta:

🕖 Segunda a Sábado: das 7h às 21h
🕖 Domingo: das 7h às 14h

📞 Telefone: ${LINKS.TELEFONE}

Estamos sempre à disposição para atendê-lo! 😊${MENSAGEM_GRUPO_OFERTAS}`
        );
        await this.mostrarMenu(msg, (await msg.getContact()).pushname || "Cliente");
        return true;
    }

    // Comando inválido
    async comandoInvalido(msg, chat) {
        await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_ERRO.COMANDO_INVALIDO);
        return true;
    }
}

module.exports = MenuHandler; 