const { CONFIG } = require('./constants');

// Função para criar delay
const delay = ms => new Promise(res => setTimeout(res, ms));

// Função para enviar mensagem com simulação de digitação
async function sendMessageWithTyping(client, chat, to, message) {
    await delay(CONFIG.DELAY_PADRAO);
    await chat.sendStateTyping();
    await delay(CONFIG.DELAY_DIGITACAO);
    await client.sendMessage(to, message);
}

// Função para validar CPF
function validarCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digitoVerificador1 = resto > 9 ? 0 : resto;
    if (digitoVerificador1 !== parseInt(cpf.charAt(9))) return false;

    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digitoVerificador2 = resto > 9 ? 0 : resto;
    if (digitoVerificador2 !== parseInt(cpf.charAt(10))) return false;

    return true;
}

// Função para formatar CPF
function formatarCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return null;
    
    // Formata o CPF
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para log com timestamp
function log(tipo, mensagem, dados = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${tipo}] ${mensagem}`;
    
    if (dados) {
        console.log(logMessage, dados);
    } else {
        console.log(logMessage);
    }
}

// Função para verificar se é uma mensagem de grupo
function isGroupMessage(msg) {
    return msg.from.endsWith('@g.us');
}

// Função para verificar se é um comando de menu
function isMenuCommand(msg) {
    if (!msg || !msg.body) return false;
    return msg.body.match(/(menu|cardapio|lista|opcoes|opções|preciso de ajuda|ajuda|comecar|começar|iniciar|ola|olá|oi|bom dia|boa tarde|boa noite|pedido|entrega|compras|mercado|supermercado|mercado eta|eta supermercado|horario|horário|funcionamento)/i) && !msg.body.match(/^[1-7]$/);
}

function formatarItens(itens) {
    return itens.map(item => `• ${item.nome} - R$ ${formatarValor(item.preco)}`).join('\n');
}

function formatarValor(valor) {
    return valor.toFixed(2).replace('.', ',');
}

module.exports = {
    delay,
    sendMessageWithTyping,
    validarCPF,
    formatarCPF,
    log,
    isGroupMessage,
    isMenuCommand,
    formatarItens,
    formatarValor
}; 