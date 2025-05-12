# 🤖 Chatbot WhatsApp - Supermercado Eta

Este projeto é um assistente virtual para WhatsApp desenvolvido para o Supermercado Eta. Ele automatiza o atendimento ao cliente, recebimento de pedidos, envio de currículos, divulgação de promoções e muito mais.

## 🚀 Funcionalidades

- Menu interativo com várias opções para o cliente
- Recebimento de pedidos para entrega
- Envio de currículos por e-mail
- Grupo de promoções no WhatsApp
- Consulta ao tabloide de ofertas
- Consulta ao horário de funcionamento
- **Encerramento de atendimento pelo cliente**
- Armazenamento dos pedidos em banco de dados SQLite
- Painel web para visualização dos pedidos (Vue.js)

## 📋 Pré-requisitos

- Node.js 14.x ou superior
- NPM ou Yarn
- WhatsApp instalado no celular

## 🏁 Como iniciar o sistema

### 1. Iniciar o bot do WhatsApp (gera o QR Code)
```bash
npm install # (apenas na primeira vez)
npm start
```
- O terminal exibirá um QR Code. Escaneie com o WhatsApp para conectar.

### 2. Iniciar o backend (API Express)
```bash
cd web-app
npm install # (apenas na primeira vez)
node server.js
```
- O backend ficará disponível em http://localhost:3000

### 3. Iniciar o frontend (painel de pedidos)
```bash
cd frontend
npm install # (apenas na primeira vez)
npm run serve
```
- O painel ficará disponível em http://localhost:8080

## 📱 Menu Principal do Bot

1. Fazer pedido para entrega 🛒
2. Enviar currículo 📄
3. Entrar no nosso grupo de promoções 💰
4. Falar com nossa equipe 💬
5. Ver nosso tabloide de ofertas 📰
6. Horário de funcionamento 🕒
7. Encerrar atendimento ❌

### Novo fluxo: Encerrar atendimento
- O cliente pode digitar **7** a qualquer momento para encerrar o atendimento.
- O bot envia uma mensagem de despedida e limpa o estado da conversa.
- Para iniciar um novo atendimento, basta enviar qualquer mensagem ou digitar "menu".

## 🛠️ Tecnologias

- Node.js
- whatsapp-web.js
- SQLite3
- Express.js (backend do painel)
- Vue.js (frontend do painel)

## 📁 Estrutura do Projeto

```
/src
├── index.js           # Ponto de entrada do bot
├── chatbot.js         # Lógica principal do bot
├── menuHandler.js     # Manipulador do menu
├── timeoutManager.js  # Gerenciador de timeout
├── pedidoService.js   # Serviço de pedidos (SQLite)
├── utils.js           # Funções utilitárias
├── constants.js       # Constantes e mensagens
└── db.sqlite          # Banco de dados
/web-app
├── server.js          # Backend Express (API)
/frontend
├── src/App.vue        # Painel de pedidos
```

## 📝 Banco de Dados

O bot utiliza SQLite para armazenar os pedidos. A tabela `pedidos` contém:

- ID do pedido (autoincremental)
- Cliente
- Itens
- Forma de pagamento
- CPF
- Status
- Data de criação
- Data de atualização

## 💡 Dicas e Observações
- Sempre inicie o bot antes do backend e frontend para garantir o fluxo correto.
- O QR Code só aparece na primeira conexão ou se perder a sessão.
- O backend e o frontend podem ser acessados de outros dispositivos na rede local, basta usar o IP da máquina onde estão rodando.
- Para reiniciar o banco de dados, basta apagar o arquivo `src/db.sqlite` (isso apagará todos os pedidos).

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NomeDaFeature`)
3. Commit suas mudanças (`git commit -m 'Minha feature'`)
4. Push para a branch (`git push origin feature/NomeDaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Gabriel Alencar

## 📞 Contato

- Email: gabrielalencardearaujo04@exemplo.com
- GitHub: [@alencarrgabriel](https://github.com/alencarrgabriel)

---
⭐️ Desenvolvido com ❤️ para o Supermercado Eta 