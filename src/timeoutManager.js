const { CONFIG, MENSAGENS_TIMEOUT } = require('./constants');
const { log } = require('./utils');

class TimeoutManager {
    constructor() {
        this.userTimeouts = {};
    }

    // Reseta o timer de timeout para um usuário
    resetTimeout(client, userId) {
        // Limpa o timer existente se houver
        if (this.userTimeouts[userId]) {
            clearTimeout(this.userTimeouts[userId]);
        }

        // Define um novo timer
        this.userTimeouts[userId] = setTimeout(async () => {
            try {
                await client.sendMessage(userId, MENSAGENS_TIMEOUT.SESSAO_ENCERRADA);
                log('INFO', 'Sessão encerrada por inatividade', { userId });
            } catch (error) {
                log('ERRO', 'Erro ao enviar mensagem de timeout:', error);
            }
        }, CONFIG.TIMEOUT_DURATION);
    }

    // Limpa o timeout de um usuário
    clearTimeout(userId) {
        if (this.userTimeouts[userId]) {
            clearTimeout(this.userTimeouts[userId]);
            delete this.userTimeouts[userId];
            log('INFO', 'Timeout limpo', { userId });
        }
    }

    // Verifica se um usuário tem timeout ativo
    hasTimeout(userId) {
        return !!this.userTimeouts[userId];
    }
}

module.exports = new TimeoutManager(); 