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

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/chatbot-whatsapp.git
cd chatbot-whatsapp
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo de constantes:
- Edite `src/constants.js` para personalizar mensagens e links

4. Inicie o bot:
```bash
npm start
```

## 💻 Uso

1. Ao iniciar, o bot gerará um QR Code no terminal
2. Escaneie o QR Code com seu WhatsApp
3. O bot estará pronto para uso

### 📱 Menu Principal

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
├── index.js           # Ponto de entrada
├── chatbot.js         # Lógica principal
├── menuHandler.js     # Manipulador do menu
├── timeoutManager.js  # Gerenciador de timeout
├── pedidoService.js   # Serviço de pedidos
├── utils.js          # Funções utilitárias
├── constants.js      # Constantes e mensagens
└── db.sqlite         # Banco de dados
```

## 📝 Banco de Dados

O bot utiliza SQLite para armazenar os pedidos. A tabela `pedidos` contém:

- ID do pedido
- Cliente
- Itens
- Forma de pagamento
- CPF
- Status
- Data de criação
- Data de atualização

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Gabriel Alencar

## 📞 Contato

- Email: seu-email@exemplo.com
- GitHub: [@seu-usuario](https://github.com/seu-usuario)

---
⭐️ Desenvolvido com ❤️ para o Supermercado Eta 