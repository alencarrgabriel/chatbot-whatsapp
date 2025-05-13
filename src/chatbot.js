const { MessageMedia } = require('whatsapp-web.js');
const path = require('path');
const fs = require('fs');
const { MENSAGENS_PEDIDO, LINKS, MENSAGENS_ERRO, CONFIG } = require('./constants');
const { formatarItens, formatarValor, sendMessageWithTyping, delay, validarCPF, isGroupMessage, isMenuCommand, log } = require('./utils');
const timeoutService = require('./timeoutService');
const pedidoService = require('./pedidoService');
const MenuHandler = require('./menuHandler');

class Chatbot {
    constructor(client, menuHandler) {
        this.client = client;
        this.menuHandler = menuHandler || new MenuHandler(client);
        this.userState = {};
    }

    async processarMensagem(msg) {
        try {
            // Ignorar mensagens de grupos
            if (isGroupMessage(msg)) {
                return;
            }

            const chat = await msg.getChat();
            const contact = await msg.getContact();
            const name = contact.pushname || "Cliente";

            // Resetar timeout do usuário
            timeoutService.resetarTimeout(this.client, msg.from);

            // Processar estado do usuário se existir
            if (this.userState[msg.from]) {
                const foiProcessado = await this.processarEstadoPedido(msg, chat);
                if (foiProcessado) return;
            }

            // Processar comandos numéricos do menu
            if (msg.body !== null && msg.body.trim().match(/^[1-7]$/)) {
                await this.processarOpcaoMenu(msg, chat, name);
                return;
            }

            // Processar comandos de menu textual
            if (isMenuCommand(msg)) {
                await this.menuHandler.mostrarMenu(msg, name);
                return;
            }

            // Mensagem padrão se nenhuma das condições acima for atendida
            await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_ERRO.COMANDO_INVALIDO);
        } catch (error) {
            log('ERRO', 'Erro ao processar mensagem:', error);
            try {
                await this.client.sendMessage(msg.from, 'Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.');
            } catch (sendError) {
                log('ERRO', 'Erro ao enviar mensagem de erro:', sendError);
            }
        }
    }

    async processarOpcaoMenu(msg, chat, name) {
        const opcao = msg.body.trim();
        
        switch (opcao) {
            case '1': // Fazer pedido
                await this.iniciarPedido(msg, chat);
                break;
            case '2': // Enviar currículo
                await this.menuHandler.enviarCurriculo(msg, chat);
                break;
            case '3': // Grupo de promoções
                await this.menuHandler.grupoPromocoes(msg, chat);
                break;
            case '4': // Falar com equipe
                await this.menuHandler.falarComEquipe(msg, chat);
                break;
            case '5': // Ver tabloide
                await this.menuHandler.verTabloide(msg, chat);
                break;
            case '6': // Horário de funcionamento
                await this.menuHandler.horarioFuncionamento(msg, chat);
                break;
            case '7': // Encerrar atendimento
                await this.encerrarAtendimento(msg, chat);
                break;
            default:
                await this.menuHandler.comandoInvalido(msg, chat);
                break;
        }
    }

    async encerrarAtendimento(msg, chat) {
        await sendMessageWithTyping(this.client, chat, msg.from, `Atendimento encerrado! Obrigado por falar conosco. 😊\n\nSe precisar de algo, é só enviar uma nova mensagem ou digitar "menu" para começar novamente.`);
        
        if (this.userState[msg.from]) {
            delete this.userState[msg.from];
        }
        
        timeoutService.limparTimeout(msg.from);
    }

    async iniciarPedido(msg, chat) {
        this.userState[msg.from] = {
            etapa: 'coleta_itens',
            itens: []
        };

        await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_PEDIDO.INICIO);
    }

    async processarEstadoPedido(msg, chat) {
        const estado = this.userState[msg.from];
        if (!estado) return false;

        try {
            switch (estado.etapa) {
                case 'coleta_itens':
                    await this.processarColetaItens(msg, chat, estado);
                    break;
                case 'confirmacao_itens':
                    await this.processarConfirmacaoItens(msg, chat, estado);
                    break;
                case 'pagamento':
                    await this.processarPagamento(msg, chat, estado);
                    break;
                case 'cpf':
                    await this.processarCPF(msg, chat, estado);
                    break;
                case 'confirmacao_final':
                    await this.processarConfirmacaoFinal(msg, chat, estado);
                    break;
                default:
                    return false;
            }
            return true;
        } catch (error) {
            log('ERRO', 'Erro ao processar estado do pedido:', error);
            return false;
        }
    }

    async processarColetaItens(msg, chat, estado) {
        const item = msg.body.trim();
        
        if (item.toLowerCase() === 'finalizar' || item.toLowerCase() === 'sim') {
            if (estado.itens.length === 0) {
                await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_ERRO.SEM_ITENS);
                return;
            }

            estado.etapa = 'confirmacao_itens';
            const itensFormatados = estado.itens.map(item => `• ${item}`).join('\n');
            await sendMessageWithTyping(
                this.client, 
                chat, 
                msg.from, 
                MENSAGENS_PEDIDO.CONFIRMACAO_LISTA(itensFormatados)
            );
        } else if (item.toLowerCase() === 'cancelar') {
            delete this.userState[msg.from];
            await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_PEDIDO.CANCELADO);
            await this.menuHandler.mostrarMenu(msg, (await msg.getContact()).pushname || "Cliente");
        } else {
            // Tenta processar como um item
            try {
                // Verifica se o item está no formato correto (produto - quantidade)
                const partes = item.split('-').map(p => p.trim());
                
                if (partes.length >= 1) {
                    let itemFormatado;
                    
                    if (partes.length >= 2) {
                        // Formato completo: produto - quantidade
                        const nomeProduto = partes[0];
                        const quantidade = partes[1];
                        itemFormatado = `${nomeProduto} - ${quantidade}`;
                    } else {
                        // Apenas o nome do produto sem quantidade
                        itemFormatado = partes[0];
                    }
                    
                    estado.itens.push(itemFormatado);
                    await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_PEDIDO.ITEM_ADICIONADO);
                } else {
                    await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_ERRO.FORMATO_INVALIDO);
                }
            } catch (error) {
                log('ERRO', 'Erro ao processar item:', error);
                await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_ERRO.FORMATO_INVALIDO);
            }
        }
    }

    async processarConfirmacaoItens(msg, chat, estado) {
        const resposta = msg.body.toLowerCase();
        
        if (resposta === 'sim') {
            estado.etapa = 'pagamento';
            await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_PEDIDO.PAGAMENTO);
        } else if (resposta === 'não' || resposta === 'nao') {
            estado.etapa = 'coleta_itens';
            estado.itens = [];
            await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_PEDIDO.REINICIAR_LISTA);
        } else {
            await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_ERRO.RESPOSTA_INVALIDA);
        }
    }

    async processarPagamento(msg, chat, estado) {
        const formaPagamento = msg.body.trim();
        estado.pagamento = formaPagamento;
        estado.etapa = 'cpf';
        await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_PEDIDO.CPF);
    }

    async processarCPF(msg, chat, estado) {
        const resposta = msg.body.trim().toLowerCase();
        
        if (resposta === 'não' || resposta === 'nao') {
            estado.cpf = 'Não informado';
            await this.finalizarPedidoComCPF(msg, chat, estado);
            return;
        }
        
        const cpf = resposta.replace(/[^\d]/g, '');
        
        if (cpf.length !== 11 || !validarCPF(cpf)) {
            await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_ERRO.CPF_INVALIDO);
            return;
        }
        
        estado.cpf = cpf;
        await this.finalizarPedidoComCPF(msg, chat, estado);
    }

    async finalizarPedidoComCPF(msg, chat, estado) {
        estado.etapa = 'confirmacao_final';
        await sendMessageWithTyping(
            this.client, 
            chat, 
            msg.from, 
            MENSAGENS_PEDIDO.RESUMO(estado.itens, estado.pagamento, estado.cpf)
        );
    }

    async processarConfirmacaoFinal(msg, chat, estado) {
        const resposta = msg.body.toLowerCase();
        
        if (resposta === 'sim') {
            try {
                // Obter informações do contato
                const contact = await msg.getContact();
                const name = contact.pushname || "Cliente";
                const numero = msg.from;
                
                const pedido = {
                    cliente: name,
                    telefone: numero,
                    itens: estado.itens,
                    pagamento: estado.pagamento,
                    cpf: estado.cpf,
                    status: 'pendente',
                    dataHora: new Date().toISOString()
                };

                await pedidoService.salvarPedido(pedido);
                log('INFO', 'Novo pedido registrado:', { cliente: name, telefone: numero });
                
                await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_PEDIDO.CONFIRMADO);
                delete this.userState[msg.from];
            } catch (error) {
                log('ERRO', 'Erro ao salvar pedido:', error);
                await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_ERRO.SALVAR_PEDIDO);
            }
        } else if (resposta === 'não' || resposta === 'nao') {
            delete this.userState[msg.from];
            await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_PEDIDO.CANCELADO);
            await this.menuHandler.mostrarMenu(msg, (await msg.getContact()).pushname || "Cliente");
        } else {
            await sendMessageWithTyping(this.client, chat, msg.from, MENSAGENS_ERRO.RESPOSTA_INVALIDA);
        }
    }
}

module.exports = Chatbot; 