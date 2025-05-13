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
const MENSAGEM_GRUPO_OFERTAS = `\n\nGostaria de ficar por dentro de todas as nossas ofertas? Participe do nosso grupo especial no WhatsApp! 🎉\nClique aqui: https://chat.whatsapp.com/GRYOqzwYGL3CEuohUrH6JD`;

// Links e contatos
const LINKS = {
    GRUPO_PROMOCOES: 'https://chat.whatsapp.com/GRYOqzwYGL3CEuohUrH6JD',
    EMAIL_CURRICULO: 'curriculos.etaguara@gmail.com',
    TELEFONE: '(61) 3877-3332'
};

// Mensagens de pedido
const MENSAGENS_PEDIDO = {
    INICIO: `📝 *Iniciando Novo Pedido*\n\nPor favor, envie os produtos um por um no formato:\n*nome do produto - quantidade*\n\nExemplos:\n*Arroz Flora 5kg - 2 unidades*\n*Feijão Carioca Kicaldo 1kg - 3 pacotes*\n*Leite Itambé Integral - 6 caixas*\n\nDigite *finalizar* quando terminar sua lista de compras.`,
    ITEM_ADICIONADO: `✅ Item adicionado à sua lista! 

Continue enviando os produtos que você deseja ou digite "finalizar" quando terminar sua lista de compras.`,
    
    LISTA_VAZIA: `Por favor, envie pelo menos um produto antes de finalizar a lista.`,
    
    CONFIRMACAO_LISTA: (lista) => `🔎 Aqui está sua lista de produtos:

${lista}

Você confirma estes produtos? (Responda com 'sim' ou 'não')`,
    
    REINICIAR_LISTA: `Certo! Vamos começar sua lista novamente.

Por favor, envie os produtos um por um. Digite "finalizar" quando terminar.`,
    
    PAGAMENTO: `💳 *Forma de Pagamento*\n\nPor favor, informe como você deseja pagar:\n- Dinheiro\n- Cartão de Crédito\n- Cartão de Débito\n- PIX`,
    
    CPF: `📋 *CPF na Nota*\n\nPor favor, informe seu CPF (apenas números) ou digite "não" se não desejar informar.`,
    
    RESUMO: (itens, pagamento, cpf) => `🔎 *Resumo do seu pedido:*

📦 *Produtos:*
${itens.join('\n')}

💳 *Forma de Pagamento:* ${pagamento}
🧾 *CPF na Nota:* ${cpf}

Você confirma este pedido? 
Responda com *sim* para confirmar ou *não* caso haja algo errado.`,
    
    CONFIRMADO: `✅ *Pedido Registrado com Sucesso!*\n\nSeu pedido foi recebido e nossa equipe entrará em contato para confirmar os itens, solicitar seu endereço e informar o prazo de entrega.\n\nAgradecemos sua preferência pelo Supermercado Eta!\n\n💰 Não esqueça de entrar no nosso grupo de promoções:\nhttps://chat.whatsapp.com/GRYOqzwYGL3CEuohUrH6JD`,
    
    CANCELADO: `❌ *Pedido Cancelado*\n\nSeu pedido foi cancelado. Para iniciar um novo pedido, envie *!menu* ou digite *1* a qualquer momento.`
};

// Mensagens de timeout
const MENSAGENS_TIMEOUT = {
    SESSAO_ENCERRADA: `Olá! Percebi que você está inativo há algum tempo. Para sua segurança, encerrei sua sessão atual. 

Se precisar de ajuda, é só enviar uma mensagem que eu volto a te atender! 

💰 Não esqueça de entrar no nosso grupo de promoções:
https://chat.whatsapp.com/GRYOqzwYGL3CEuohUrH6JD`
};

// Mensagens de erro
const MENSAGENS_ERRO = {
    SEM_ITENS: '❌ *Erro*\n\nVocê precisa adicionar pelo menos um produto antes de finalizar.',
    FORMATO_INVALIDO: '❌ *Erro*\n\nFormato inválido. Use o formato:\n*nome do produto - quantidade*\n\nExemplo: Arroz Flora 5kg - 2 unidades',
    RESPOSTA_INVALIDA: '❌ *Erro*\n\nPor favor, responda apenas com "sim" ou "não".',
    CPF_INVALIDO: '❌ *Erro*\n\nCPF inválido. Por favor, informe apenas os números.',
    SALVAR_PEDIDO: '❌ *Erro*\n\nDesculpe, houve um erro ao processar seu pedido. Por favor, tente novamente.',
    COMANDO_INVALIDO: 'Desculpe, não entendi sua mensagem. 🤔 \n\nPor favor, digite uma das opções do menu:\n\n*1 - Fazer pedido para entrega* 🛒\n*2 - Enviar currículo* 📄\n*3 - Entrar no nosso grupo de promoções* 💰\n*4 - Falar com nossa equipe* 💬\n*5 - Ver nosso tabloide de ofertas* 📰\n*6 - Horário de funcionamento* 🕒\n*7 - Encerrar atendimento* ❌\n\nOu escreva "menu" para ver as opções novamente.',
    TABLOIDE_INDISPONIVEL: `Desculpe, mas o tabloide de ofertas não está disponível no momento. Por favor, tente novamente mais tarde. 😊\n\nBoas compras! 🛍️${MENSAGEM_GRUPO_OFERTAS}`
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