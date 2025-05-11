// leitor de qr code
const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js'); // Mudança Buttons
const fs = require('fs');
const path = require('path');
const client = new Client();
// serviço de leitura do qr code
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});
// apos isso ele diz que foi tudo certo
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado ao Supermercado Eta.');
});
// E inicializa tudo 
client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms)); // Função que usamos para criar o delay entre uma ação e outra

// Funil Supermercado Eta

client.on('message', async msg => {

    // Verifica se a mensagem não é de um grupo
    if (msg.from.endsWith('@g.us')) {
        return; // Ignora mensagens de grupos
    }

    const chat = await msg.getChat();
    const contact = await msg.getContact(); //Pegando o contato
    const name = contact.pushname || "Cliente"; //Pegando o nome do contato ou usando "Cliente" como padrão

    // Regex para capturar saudações e termos relacionados ao supermercado
    if (msg.body.match(/(menu|cardapio|lista|opcoes|opções|preciso de ajuda|ajuda|comecar|começar|iniciar|ola|olá|oi|bom dia|boa tarde|boa noite|pedido|entrega|compras|mercado|supermercado|mercado eta|eta supermercado|horario|horário|funcionamento)/i) && !msg.body.match(/^[1-5]$/)) { // Evita reativar com números de opção

        await delay(1500); 
        await chat.sendStateTyping(); 
        await delay(2000); 
        
        await client.sendMessage(msg.from, `Olá, ${name.split(" ")[0]}! 👋 Sou o assistente virtual do Supermercado Eta. Como posso te ajudar hoje? 😊

Digite o número da opção desejada:

*1 - Fazer pedido para entrega* 🛒
*2 - Enviar currículo* 📄
*3 - Entrar no nosso grupo de promoções* 💰
*4 - Falar com nossa equipe* 💬
*5 - Ver nosso tabloide de ofertas* 📰
*6 - Horário de funcionamento* 🕒`);
        return; // Encerra o processamento aqui para não cair em outras condições
    }

    // Variável para guardar a mensagem final do grupo de ofertas
    const mensagemGrupoOfertas = `\n\nGostaria de ficar por dentro de todas as nossas ofertas? Participe do nosso grupo especial no WhatsApp! 🎉\nClique aqui: https://chat.whatsapp.com/promocoeseta`; // ATENÇÃO: Substitua SEU_LINK_AQUI pelo link real do seu grupo

    if (msg.body !== null && msg.body.trim() === '1') {
        await delay(1500);
        await chat.sendStateTyping();
        await delay(2000);

        // Envia as instruções para o cliente
        await client.sendMessage(msg.from, `Ótimo! Vamos fazer seu pedido para entrega. 🚚🛒

Por favor, envie as seguintes informações no modelo abaixo:

📦 *Itens desejados* (produto + quantidade):
- Ex: Arroz Flora 5kg - 2 unidades
- Ex: Toddyinho 200ml - 5 unidades

💳 *Forma de pagamento*:
- Cartão de crédito, débito ou dinheiro? Se for dinheiro, precisa de troco?

🧾 *Deseja CPF na nota?* (Opcional)
- Ex: 000.000.000-00

Assim que você enviar essas informações, nossa equipe irá conferir os detalhes e confirmar com você! 😊

*Exemplo completo:*
- Arroz Tio João 1kg - 3 unidades
- Leite Italac - 2 unidades
CPF: 123.456.789-00
Pagamento: Dinheiro (troco para R$ 100)

💰 Não esqueça de entrar no nosso grupo de promoções:
https://chat.whatsapp.com/promocoeseta`);

    } else if (msg.body !== null && msg.body.trim() === '2') {
        await delay(1500);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(msg.from, `Que bom que você tem interesse em trabalhar conosco! 😊

Para enviar seu currículo, por favor, mande um e-mail para: curriculos.etaguara@gmail.com

Boa sorte! 🤞${mensagemGrupoOfertas}`);

    } else if (msg.body !== null && msg.body.trim() === '3') {
        await delay(1500);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(msg.from, `Oba! 🎉 Fique por dentro de todas as nossas promoções fresquinhas!

Clique no link abaixo para entrar no nosso grupo de promoções do WhatsApp:
https://chat.whatsapp.com/promocoeseta

Esperamos você lá! 😉`); 
        // A mensagem final de convite ao grupo de ofertas já está no texto principal desta opção.

    } else if (msg.body !== null && msg.body.trim() === '4') {
        await delay(1500);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(msg.from, `Para falar com nossa equipe, você pode:
📞 Ligar para: (61) 3877-3332 durante nosso horário comercial:
   • Segunda a Sábado: 7h às 21h
   • Domingo: 7h às 14h
   
💬 Ou, se preferir, aguarde um momento que logo um de nossos atendentes irá te responder por aqui no WhatsApp.

Por favor, nos diga como podemos te ajudar.${mensagemGrupoOfertas}`);

    } else if (msg.body !== null && msg.body.trim() === '5') {
        await delay(1500);
        await chat.sendStateTyping();
        await delay(2000);
        
        try {
            // Carrega a imagem do tabloide da raiz do projeto
            const tabloidePath = path.join(__dirname, 'tabloide.png'); // Você pode mudar a extensão para .png, .pdf etc.
            
            if (fs.existsSync(tabloidePath)) {
                // Se o arquivo existe, carrega e envia a imagem
                const media = MessageMedia.fromFilePath(tabloidePath);
                
                // Envia a imagem com um texto
                await client.sendMessage(msg.from, `Confira nossas ofertas incríveis no tabloide desta semana! 📰✨

Boas compras! 🛍️${mensagemGrupoOfertas}`);
                
                await delay(1000);
                await client.sendMessage(msg.from, media, {caption: 'Tabloide de ofertas do Supermercado Eta! 🛒'});
            } else {
                // Se o arquivo não existe, envia mensagem de erro
                await client.sendMessage(msg.from, `Desculpe, mas o tabloide de ofertas não está disponível no momento. Por favor, tente novamente mais tarde. 😊

Boas compras! 🛍️${mensagemGrupoOfertas}`);
            }
        } catch (error) {
            console.error('Erro ao enviar o tabloide:', error);
            
            // Em caso de erro, envia mensagem de erro
            await client.sendMessage(msg.from, `Desculpe, mas o tabloide de ofertas não está disponível no momento. Por favor, tente novamente mais tarde. 😊

Boas compras! 🛍️${mensagemGrupoOfertas}`);
        }

    } else if (msg.body !== null && msg.body.trim() === '6') {
        await delay(1500);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(msg.from, `📅 Horário de Funcionamento do Supermercado Eta:

🕖 Segunda a Sábado: das 7h às 21h
🕖 Domingo: das 7h às 14h

📞 Telefone: (61) 3877-3332

Estamos sempre à disposição para atendê-lo! 😊${mensagemGrupoOfertas}`);

    } else if (msg.body !== null && !msg.body.match(/(menu|cardapio|lista|opcoes|opções|preciso de ajuda|ajuda|comecar|começar|iniciar|ola|olá|oi|bom dia|boa tarde|boa noite|pedido|entrega|compras|mercado|supermercado|mercado eta|eta supermercado|horario|horário|funcionamento)/i) && !msg.body.match(/^[1-6]$/)) {
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
    }
});