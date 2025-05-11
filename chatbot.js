// leitor de qr code
const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js');
const path = require('path');
const pedidoService = require('./src/pedidoService');
const client = new Client();

// Objeto para armazenar o estado dos usuários
const userState = {};

// Objeto para armazenar os timers de timeout
const userTimeouts = {};

// Tempo de inatividade em milissegundos (5 minutos)
const TIMEOUT_DURATION = 5 * 60 * 1000;

// Função para resetar o timer de timeout
function resetTimeout(userId) {
    if (userTimeouts[userId]) {
        clearTimeout(userTimeouts[userId]);
    }

    userTimeouts[userId] = setTimeout(async () => {
        if (userState[userId]) {
            await client.sendMessage(userId, `Olá! Percebi que você está inativo há algum tempo. Para sua segurança, encerrei sua sessão atual. 

Se precisar de ajuda, é só enviar uma mensagem que eu volto a te atender! 😊

💰 Não esqueça de entrar no nosso grupo de promoções:
https://chat.whatsapp.com/promocoeseta`);

            delete userState[userId];
            delete userTimeouts[userId];
        }
    }, TIMEOUT_DURATION);
}

// Função para salvar pedido confirmado
async function salvarPedido(pedido) {
    try {
        await pedidoService.salvarPedido({
            ...pedido,
            status: 'confirmado'
        });
        console.log('Novo pedido:', pedido);
    } catch (error) {
        console.error('Erro ao salvar pedido:', error);
    }
}

// Função para mostrar o menu principal
async function mostrarMenu(msg, name) {
    await client.sendMessage(msg.from, `Olá, ${name.split(" ")[0]}! 👋 Sou o assistente virtual do Supermercado Eta. Como posso te ajudar hoje? 😊

Digite o número da opção desejada:

*1 - Fazer pedido para entrega* 🛒
*2 - Enviar currículo* 📄
*3 - Entrar no nosso grupo de promoções* 💰
*4 - Falar com nossa equipe* 💬
*5 - Ver nosso tabloide de ofertas* 📰
*6 - Horário de funcionamento* 🕒`);
}

// serviço de leitura do qr code
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado ao Supermercado Eta.');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

client.on('message', async msg => {
    if (msg.from.endsWith('@g.us')) {
        return;
    }

    resetTimeout(msg.from);

    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const name = contact.pushname || "Cliente";

    // Verifica estados específicos do pedido
    if (userState[msg.from]) {
        const estado = userState[msg.from].stage;
        const resposta = msg.body.toLowerCase();

        switch (estado) {
            case 'coletando_itens':
                if (resposta === 'sim') {
                    if (userState[msg.from].itens.length === 0) {
                        await client.sendMessage(msg.from, `Por favor, envie pelo menos um item antes de finalizar a lista.`);
                        return;
                    }

                    const listaFormatada = userState[msg.from].itens.join('\n');
                    await client.sendMessage(msg.from, `🔎 Aqui está sua lista de produtos:

${listaFormatada}

Você confirma esses produtos? (Responda com 'sim' ou 'não')`);

                    userState[msg.from].stage = 'confirmando_itens';
                } else {
                    userState[msg.from].itens.push(msg.body);
                    await client.sendMessage(msg.from, `✅ Item adicionado! 

Continue enviando os produtos ou digite "sim" quando terminar.`);
                }
                return;

            case 'confirmando_itens':
                if (resposta === 'sim') {
                    await client.sendMessage(msg.from, `📝 Lista de produtos confirmada! 

Agora, me diga qual será a forma de pagamento:
- Cartão de crédito
- Cartão de débito
- Dinheiro
- PIX

Se for pagar em dinheiro, me avise se precisará de troco e para qual valor.`);

                    userState[msg.from].stage = 'coletando_pagamento';
                } else if (resposta === 'não' || resposta === 'nao') {
                    userState[msg.from].itens = [];
                    await client.sendMessage(msg.from, `Certo! Vamos começar a lista novamente.

Por favor, envie os produtos um por um. Digite "sim" quando terminar.`);
                    userState[msg.from].stage = 'coletando_itens';
                } else {
                    await client.sendMessage(msg.from, `Por favor, responda apenas com 'sim' ou 'não'.`);
                }
                return;

            case 'coletando_pagamento':
                userState[msg.from].pagamento = msg.body;
                await client.sendMessage(msg.from, `💳 Forma de pagamento registrada!

Por último, você deseja incluir CPF na nota?
Se sim, envie o CPF no formato: 000.000.000-00
Se não, apenas digite "não".`);

                userState[msg.from].stage = 'coletando_cpf';
                return;

            case 'coletando_cpf':
                const cpfRegex = /\d{3}\.\d{3}\.\d{3}-\d{2}/;
                const cpf = msg.body.match(cpfRegex) ? msg.body.match(cpfRegex)[0] : 'Não informado';
                userState[msg.from].cpf = cpf;

                const resumo = `🔎 *Resumo do seu pedido:*

📦 *Produtos:*
${userState[msg.from].itens.join('\n')}

💳 *Forma de Pagamento:* ${userState[msg.from].pagamento}
🧾 *CPF na Nota:* ${cpf}

Você confirma esse pedido? 
Responda com *sim* para confirmar ou *não* caso haja algo errado.`;

                await client.sendMessage(msg.from, resumo);
                userState[msg.from].stage = 'aguardando_confirmacao_final';
                return;

            case 'aguardando_confirmacao_final':
                if (resposta === 'sim') {
                    const pedido = {
                        itens: userState[msg.from].itens,
                        pagamento: userState[msg.from].pagamento,
                        cpf: userState[msg.from].cpf,
                        cliente: msg.from
                    };

                    await salvarPedido(pedido);

                    await client.sendMessage(msg.from, `✅ Pedido confirmado!

Nossa equipe está conferindo os detalhes e em breve entrará em contato com você. Muito obrigado por comprar com o Supermercado Eta! 🛒

💰 Não esqueça de entrar no nosso grupo de promoções:
https://chat.whatsapp.com/promocoeseta`);

                    delete userState[msg.from];
                    delete userTimeouts[msg.from];
                } else if (resposta === 'não' || resposta === 'nao') {
                    await client.sendMessage(msg.from, `Certo! Nossa equipe será notificada para entrar em contato com você e confirmar os dados do pedido. Aguarde nosso retorno pelo WhatsApp. 😊

💰 Não esqueça de entrar no nosso grupo de promoções:
https://chat.whatsapp.com/promocoeseta`);

                    console.log('Pedido PENDENTE:', userState[msg.from]);
                    delete userState[msg.from];
                    delete userTimeouts[msg.from];
                } else {
                    await client.sendMessage(msg.from, `Por favor, responda apenas com *sim* ou *não*.`);
                }
                return;
        }
    }

    // Verifica opções do menu
    if (msg.body !== null && msg.body.trim() === '1') {
        await delay(1500);
        await chat.sendStateTyping();
        await delay(2000);

        await client.sendMessage(msg.from, `Ótimo! Vamos fazer seu pedido para entrega. 🚚🛒

Por favor, envie os produtos um por um.
Digite "sim" quando terminar a lista.

*Exemplo:*
Arroz Tio João 1kg - 2 unidades
Feijão Carioca - 1 unidade
Café Pilão 500g - 1 unidade`);

        userState[msg.from] = {
            stage: 'coletando_itens',
            itens: [],
            pagamento: null,
            cpf: null
        };
        return;
    }

    // Verifica saudações e comandos de menu
    if (msg.body.match(/(menu|cardapio|lista|opcoes|opções|preciso de ajuda|ajuda|comecar|começar|iniciar|ola|olá|oi|bom dia|boa tarde|boa noite|pedido|entrega|compras|mercado|supermercado|mercado eta|eta supermercado|horario|horário|funcionamento)/i) && !msg.body.match(/^[1-6]$/)) {
        await delay(1500);
        await chat.sendStateTyping();
        await delay(2000);
        
        await mostrarMenu(msg, name);
        return;
    }

    // Variável para guardar a mensagem final do grupo de ofertas
    const mensagemGrupoOfertas = `\n\nGostaria de ficar por dentro de todas as nossas ofertas? Participe do nosso grupo especial no WhatsApp! 🎉\nClique aqui: https://chat.whatsapp.com/promocoeseta`;

    // Outras opções do menu
    if (msg.body !== null && msg.body.trim() === '2') {
        await delay(1500);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(msg.from, `Que bom que você tem interesse em trabalhar conosco! 😊

Para enviar seu currículo, por favor, mande um e-mail para: curriculos.etaguara@gmail.com

Boa sorte! 🤞${mensagemGrupoOfertas}`);
        await mostrarMenu(msg, name);
        return;
    }

    if (msg.body !== null && msg.body.trim() === '3') {
        await delay(1500);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(msg.from, `Oba! 🎉 Fique por dentro de todas as nossas promoções fresquinhas!

Clique no link abaixo para entrar no nosso grupo de promoções do WhatsApp:
https://chat.whatsapp.com/promocoeseta

Esperamos você lá! 😉`);
        await mostrarMenu(msg, name);
        return;
    }

    if (msg.body !== null && msg.body.trim() === '4') {
        await delay(1500);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(msg.from, `Para falar com nossa equipe, você pode:
📞 Ligar para: (61) 3877-3332 durante nosso horário comercial:
   • Segunda a Sábado: 7h às 21h
   • Domingo: 7h às 14h
   
💬 Ou, se preferir, aguarde um momento que logo um de nossos atendentes irá te responder por aqui no WhatsApp.

Por favor, nos diga como podemos te ajudar.${mensagemGrupoOfertas}`);
        await mostrarMenu(msg, name);
        return;
    }

    if (msg.body !== null && msg.body.trim() === '5') {
        await delay(1500);
        await chat.sendStateTyping();
        await delay(2000);
        
        try {
            const tabloidePath = path.join(__dirname, 'tabloide.png');
            
            if (fs.existsSync(tabloidePath)) {
                const media = MessageMedia.fromFilePath(tabloidePath);
                
                await client.sendMessage(msg.from, `Confira nossas ofertas incríveis no tabloide desta semana! 📰✨

Boas compras! 🛍️${mensagemGrupoOfertas}`);
                
                await delay(1000);
                await client.sendMessage(msg.from, media, {caption: 'Tabloide de ofertas do Supermercado Eta! 🛒'});
            } else {
                await client.sendMessage(msg.from, `Desculpe, mas o tabloide de ofertas não está disponível no momento. Por favor, tente novamente mais tarde. 😊

Boas compras! 🛍️${mensagemGrupoOfertas}`);
            }
        } catch (error) {
            console.error('Erro ao enviar o tabloide:', error);
            await client.sendMessage(msg.from, `Desculpe, mas o tabloide de ofertas não está disponível no momento. Por favor, tente novamente mais tarde. 😊

Boas compras! 🛍️${mensagemGrupoOfertas}`);
        }
        await mostrarMenu(msg, name);
        return;
    }

    if (msg.body !== null && msg.body.trim() === '6') {
        await delay(1500);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(msg.from, `📅 Horário de Funcionamento do Supermercado Eta:

🕖 Segunda a Sábado: das 7h às 21h
🕖 Domingo: das 7h às 14h

📞 Telefone: (61) 3877-3332

Estamos sempre à disposição para atendê-lo! 😊${mensagemGrupoOfertas}`);
        await mostrarMenu(msg, name);
        return;
    }

    // Mensagem para quando o usuário enviar algo que não reconhecemos
    await delay(1000);
    await chat.sendStateTyping();
    await delay(1500);
    await client.sendMessage(msg.from, `Desculpe, não entendi sua mensagem. 🤔 

Por favor, digite uma das opções do menu:

*1 - Fazer pedido para entrega* 🛒
*2 - Enviar currículo* 📄
*3 - Entrar no nosso grupo de promoções* 💰
*4 - Falar com nossa equipe* 💬
*5 - Ver nosso tabloide de ofertas* 📰
*6 - Horário de funcionamento* 🕒

Ou escreva "menu" para ver as opções novamente.`);
});