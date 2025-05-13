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
        const chat = await msg.getChat();
        await sendMessageWithTyping(this.client, chat, msg.from, MENU_PRINCIPAL(name));
    }

    // Opção 2 - Enviar currículo
    async enviarCurriculo(msg, chat) {
        await sendMessageWithTyping(this.client, chat, msg.from, 
            `Que bom que você tem interesse em trabalhar conosco! 😊

Para enviar seu currículo, por favor, mande um e-mail para: ${LINKS.EMAIL_CURRICULO}

Boa sorte! 🤞${MENSAGEM_GRUPO_OFERTAS}`
        );
    }

    // Opção 3 - Grupo de promoções
    async grupoPromocoes(msg, chat) {
        await sendMessageWithTyping(this.client, chat, msg.from, 
            `Oba! 🎉 Fique por dentro de todas as nossas promoções fresquinhas!

Clique no link abaixo para entrar no nosso grupo de promoções do WhatsApp:
${LINKS.GRUPO_PROMOCOES}

Esperamos você lá! 😉`
        );
    }

    // Opção 4 - Falar com equipe
    async falarComEquipe(msg, chat) {
        try {
            await sendMessageWithTyping(this.client, chat, msg.from, 
                `Para falar com nossa equipe, você pode:
📞 Ligar para: ${LINKS.TELEFONE} durante nosso horário comercial:
   • Segunda a Sábado: 7h às 21h
   • Domingo: 7h às 14h
   
💬 Ou, se preferir, aguarde um momento que logo um de nossos atendentes irá te responder por aqui no WhatsApp.

Por favor, nos diga como podemos te ajudar.${MENSAGEM_GRUPO_OFERTAS}`
            );
            
            // Notifica internamente que o cliente está aguardando atendimento
            log('INFO', 'Cliente solicitou atendimento com a equipe', { from: msg.from, contato: (await msg.getContact()).pushname || "Cliente" });
        } catch (error) {
            log('ERRO', 'Erro ao processar solicitação para falar com a equipe:', error);
        }
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
                log('AVISO', 'Arquivo do tabloide não encontrado', { tabloidePath });
                await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_ERRO.TABLOIDE_INDISPONIVEL);
            }
        } catch (error) {
            log('ERRO', 'Erro ao enviar tabloide:', error);
            await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_ERRO.TABLOIDE_INDISPONIVEL);
        }
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
    }

    // Comando inválido
    async comandoInvalido(msg, chat) {
        await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_ERRO.COMANDO_INVALIDO);
    }

    // Processar comandos do tipo !comando
    async processarComando(msg) {
        try {
            const comando = msg.body.trim().toLowerCase().replace('!', '');
            const chat = await msg.getChat();
            const name = (await msg.getContact()).pushname || "Cliente";
            
            switch (comando) {
                case 'menu':
                    await this.mostrarMenu(msg, name);
                    break;
                case 'curriculo':
                case 'currículo':
                    await this.enviarCurriculo(msg, chat);
                    break;
                case 'promocoes':
                case 'promoções':
                    await this.grupoPromocoes(msg, chat);
                    break;
                case 'ajuda':
                case 'help':
                    await this.falarComEquipe(msg, chat);
                    break;
                case 'tabloide':
                case 'ofertas':
                    await this.verTabloide(msg, chat);
                    break;
                case 'horario':
                case 'horário':
                    await this.horarioFuncionamento(msg, chat);
                    break;
                default:
                    await this.comandoInvalido(msg, chat);
                    break;
            }
        } catch (error) {
            log('ERRO', 'Erro ao processar comando:', error);
        }
    }
}

module.exports = MenuHandler; 