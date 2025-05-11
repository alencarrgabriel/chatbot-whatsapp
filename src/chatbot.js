const { MessageMedia } = require('whatsapp-web.js');
const path = require('path');
const fs = require('fs');
const { MENSAGENS_PEDIDO, LINKS, MENSAGENS_ERRO } = require('./constants');
const { formatarItens, formatarValor } = require('./utils');
const { gerenciarTimeout, resetarTimeout } = require('./timeoutService');
const pedidoService = require('./pedidoService');
const MenuHandler = require('./menuHandler');

class Chatbot {
    constructor(client) {
        this.client = client;
        this.menuHandler = new MenuHandler(client);
        this.userState = {};
    }

    async processarMensagem(msg) {
        // Ignorar mensagens de grupos
        if (msg.from.endsWith('@g.us')) {
            return;
        }

        // Resetar timeout do usuário
        resetarTimeout(msg.from);

        // Processar comando do menu
        if (msg.body.startsWith('!')) {
            await this.menuHandler.processarComando(msg);
            return;
        }

        // Processar estado do usuário
        const estado = this.userState[msg.from];
        if (estado) {
            await this.processarEstadoPedido(msg, estado);
        }

        if (msg.body !== null && msg.body.trim() === '7') {
            await this.delay(1000);
            await this.sendStateTyping();
            await this.delay(1500);
            await this.client.sendMessage(msg.from, `Atendimento encerrado! Obrigado por falar conosco. 😊\n\nSe precisar de algo, é só enviar uma nova mensagem ou digitar "menu" para começar novamente.`);
            delete this.userState[msg.from];
            delete this.userTimeouts[msg.from];
            return;
        }
    }

    async iniciarPedido(msg) {
        this.userState[msg.from] = {
            etapa: 'coleta_itens',
            itens: []
        };

        await this.client.sendMessage(msg.from, MENSAGENS_PEDIDO.INICIO);
    }

    async processarEstadoPedido(msg, estado) {
        switch (estado.etapa) {
            case 'coleta_itens':
                await this.processarColetaItens(msg, estado);
                break;
            case 'confirmacao_itens':
                await this.processarConfirmacaoItens(msg, estado);
                break;
            case 'pagamento':
                await this.processarPagamento(msg, estado);
                break;
            case 'cpf':
                await this.processarCPF(msg, estado);
                break;
            case 'confirmacao_final':
                await this.processarConfirmacaoFinal(msg, estado);
                break;
        }
    }

    async processarColetaItens(msg, estado) {
        const item = msg.body.trim();
        if (item.toLowerCase() === 'finalizar') {
            if (estado.itens.length === 0) {
                await this.client.sendMessage(msg.from, MENSAGENS_ERRO.SEM_ITENS);
                return;
            }

            estado.etapa = 'confirmacao_itens';
            const mensagem = `📋 *Resumo do Pedido*\n\n${formatarItens(estado.itens)}\n\nTotal: R$ ${formatarValor(estado.itens.reduce((total, item) => total + item.preco, 0))}\n\nConfirma os itens? (sim/não)`;
            await this.client.sendMessage(msg.from, mensagem);
        } else {
            // Processar novo item
            const [nome, preco] = item.split('-').map(s => s.trim());
            if (!nome || !preco || isNaN(preco)) {
                await this.client.sendMessage(msg.from, MENSAGENS_ERRO.FORMATO_INVALIDO);
                return;
            }

            estado.itens.push({
                nome,
                preco: parseFloat(preco)
            });

            await this.client.sendMessage(msg.from, `✅ Item adicionado!\n\n${formatarItens(estado.itens)}\n\nAdicione mais itens ou digite *finalizar* para concluir.`);
        }
    }

    async processarConfirmacaoItens(msg, estado) {
        const resposta = msg.body.toLowerCase();
        if (resposta === 'sim') {
            estado.etapa = 'pagamento';
            await this.client.sendMessage(msg.from, MENSAGENS_PEDIDO.PAGAMENTO);
        } else if (resposta === 'não') {
            delete this.userState[msg.from];
            await this.client.sendMessage(msg.from, MENSAGENS_PEDIDO.CANCELADO);
        } else {
            await this.client.sendMessage(msg.from, MENSAGENS_ERRO.RESPOSTA_INVALIDA);
        }
    }

    async processarPagamento(msg, estado) {
        const formaPagamento = msg.body.trim();
        estado.pagamento = formaPagamento;
        estado.etapa = 'cpf';
        await this.client.sendMessage(msg.from, MENSAGENS_PEDIDO.CPF);
    }

    async processarCPF(msg, estado) {
        const cpf = msg.body.trim();
        if (!/^\d{11}$/.test(cpf)) {
            await this.client.sendMessage(msg.from, MENSAGENS_ERRO.CPF_INVALIDO);
            return;
        }

        estado.cpf = cpf;
        estado.etapa = 'confirmacao_final';
        const mensagem = `📋 *Confirmação Final*\n\n${formatarItens(estado.itens)}\n\nTotal: R$ ${formatarValor(estado.itens.reduce((total, item) => total + item.preco, 0))}\n\nForma de Pagamento: ${estado.pagamento}\nCPF: ${cpf}\n\nConfirma o pedido? (sim/não)`;
        await this.client.sendMessage(msg.from, mensagem);
    }

    async processarConfirmacaoFinal(msg, estado) {
        const resposta = msg.body.toLowerCase();
        if (resposta === 'sim') {
            try {
                const pedido = {
                    cliente: msg.from,
                    itens: estado.itens,
                    pagamento: estado.pagamento,
                    cpf: estado.cpf,
                    status: 'confirmado'
                };

                await pedidoService.salvarPedido(pedido);
                console.log('Novo pedido:', pedido);

                await this.client.sendMessage(msg.from, MENSAGENS_PEDIDO.CONFIRMADO);
                delete this.userState[msg.from];
            } catch (error) {
                console.error('Erro ao salvar pedido:', error);
                await this.client.sendMessage(msg.from, MENSAGENS_ERRO.SALVAR_PEDIDO);
            }
        } else if (resposta === 'não') {
            delete this.userState[msg.from];
            await this.client.sendMessage(msg.from, MENSAGENS_PEDIDO.CANCELADO);
        } else {
            await this.client.sendMessage(msg.from, MENSAGENS_ERRO.RESPOSTA_INVALIDA);
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async sendStateTyping() {
        await this.client.sendStateTyping();
    }
}

module.exports = Chatbot; 