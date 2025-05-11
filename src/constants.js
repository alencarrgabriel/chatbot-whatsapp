// Mensagens do menu principal
const MENU_PRINCIPAL = (nome) => `Olá, ${nome.split(" ")[0]}! 👋 Sou o assistente virtual do Supermercado Eta. Como posso te ajudar hoje? 😊

Digite o número da opção desejada:

*1 - Fazer pedido para entrega* 🛒
*2 - Enviar currículo* 📄
*3 - Entrar no nosso grupo de promoções* 💰
*4 - Falar com nossa equipe* 💬
*5 - Ver nosso tabloide de ofertas* 📰
*6 - Horário de funcionamento* 🕒
*7 - Encerrar atendimento* ❌`;

// Mensagem do grupo de promoções
const MENSAGEM_GRUPO_OFERTAS = `\n\nGostaria de ficar por dentro de todas as nossas ofertas? Participe do nosso grupo especial no WhatsApp! 🎉\nClique aqui: https://chat.whatsapp.com/promocoeseta`;

// Links e contatos
const LINKS = {
    GRUPO_PROMOCOES: 'https://chat.whatsapp.com/promocoeseta',
    EMAIL_CURRICULO: 'curriculos@empresa.com.br'
};

// Mensagens de pedido
const MENSAGENS_PEDIDO = {
    INICIO: `📝 *Iniciando Novo Pedido*\n\nPor favor, envie os itens no formato:\n*nome do item - preço*\n\nExemplo:\n*X-Burger - 15.90*\n\nDigite *finalizar* quando terminar.`,
    ITEM_ADICIONADO: `✅ Item adicionado! 

Continue enviando os produtos ou digite "sim" quando terminar.`,
    
    LISTA_VAZIA: `Por favor, envie pelo menos um item antes de finalizar a lista.`,
    
    CONFIRMACAO_LISTA: (lista) => `🔎 Aqui está sua lista de produtos:

${lista}

Você confirma esses produtos? (Responda com 'sim' ou 'não')`,
    
    REINICIAR_LISTA: `Certo! Vamos começar a lista novamente.

Por favor, envie os produtos um por um. Digite "sim" quando terminar.`,
    
    PAGAMENTO: `💳 *Forma de Pagamento*\n\nPor favor, informe a forma de pagamento:\n- Dinheiro\n- Cartão de Crédito\n- Cartão de Débito\n- PIX`,
    
    CPF: `📋 *CPF na Nota*\n\nPor favor, informe seu CPF (apenas números) ou digite "não" se não desejar informar.`,
    
    RESUMO: (itens, pagamento, cpf) => `🔎 *Resumo do seu pedido:*

📦 *Produtos:*
${itens.join('\n')}

💳 *Forma de Pagamento:* ${pagamento}
🧾 *CPF na Nota:* ${cpf}

Você confirma esse pedido? 
Responda com *sim* para confirmar ou *não* caso haja algo errado.`,
    
    CONFIRMADO: `✅ *Pedido Confirmado!*\n\nSeu pedido foi registrado com sucesso!\n\n💰 Não esqueça de entrar no nosso grupo de promoções:\nhttps://chat.whatsapp.com/promocoeseta`,
    
    CANCELADO: `❌ *Pedido Cancelado*\n\nSeu pedido foi cancelado. Para iniciar um novo pedido, envie *!menu*`
};

// Mensagens de timeout
const MENSAGENS_TIMEOUT = {
    SESSAO_ENCERRADA: `Olá! Percebi que você está inativo há algum tempo. Para sua segurança, encerrei sua sessão atual. 

Se precisar de ajuda, é só enviar uma mensagem que eu volto a te atender! 

💰 Não esqueça de entrar no nosso grupo de promoções:
https://chat.whatsapp.com/promocoeseta`
};

// Mensagens de erro
const MENSAGENS_ERRO = {
    SEM_ITENS: '❌ *Erro*\n\nVocê precisa adicionar pelo menos um item antes de finalizar.',
    FORMATO_INVALIDO: '❌ *Erro*\n\nFormato inválido. Use o formato:\n*nome do item - preço*',
    RESPOSTA_INVALIDA: '❌ *Erro*\n\nPor favor, responda apenas com "sim" ou "não".',
    CPF_INVALIDO: '❌ *Erro*\n\nCPF inválido. Por favor, informe apenas os números.',
    SALVAR_PEDIDO: '❌ *Erro*\n\nDesculpe, houve um erro ao processar seu pedido. Por favor, tente novamente.'
};

// Configurações
const CONFIG = {
    TIMEOUT_DURATION: 5 * 60 * 1000, // 5 minutos
    DELAY_PADRAO: 1500,
    DELAY_DIGITACAO: 2000
};

module.exports = {
    MENU_PRINCIPAL,
    MENSAGEM_GRUPO_OFERTAS,
    LINKS,
    MENSAGENS_PEDIDO,
    MENSAGENS_TIMEOUT,
    MENSAGENS_ERRO,
    CONFIG
}; 