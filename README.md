# 🤖 Chatbot WhatsApp - Supermercado Eta

Este projeto é um assistente virtual para WhatsApp desenvolvido para o Supermercado Eta, automatizando o atendimento ao cliente, recebimento de pedidos de produtos do supermercado, divulgação de promoções e muito mais.

## 🚀 Funcionalidades

- **Menu interativo** com diversas opções para o cliente
- **Módulo de pedidos** para entregas de produtos do supermercado
- **Processamento inteligente** de itens como "Arroz Flora 5kg - 2 unidades"
- **Status de pedido pendente** para revisão pela equipe antes da entrega
- **Envio de currículos** por e-mail
- **Grupo de promoções** no WhatsApp
- **Consulta ao tabloide** de ofertas
- **Consulta ao horário** de funcionamento do supermercado
- **Encerramento de atendimento** pelo cliente
- **Armazenamento dos pedidos** em banco de dados SQLite
- **Painel web responsivo** para visualização e gerenciamento dos pedidos
- **Comunicação direta** com clientes via WhatsApp a partir do painel
- **Acesso via rede local** - sistema acessível de outras máquinas da mesma rede

## 📋 Pré-requisitos

- Node.js 14.x ou superior
- NPM ou Yarn
- WhatsApp instalado no celular para leitura do QR Code
- Acesso à mesma rede WiFi para uso entre dispositivos

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
- O backend ficará disponível em http://localhost:8080

### 3. Iniciar o frontend (painel de pedidos)
```bash
cd frontend
npm install # (apenas na primeira vez)
npm run serve
```
- O painel ficará disponível em http://localhost:8080
- **Nota:** O sistema mostrará os IPs da rede local para acesso de outros dispositivos

## 📱 Menu Principal do Bot

1. Fazer pedido para entrega 🛒
2. Enviar currículo 📄
3. Entrar no nosso grupo de promoções 💰
4. Falar com nossa equipe 💬
5. Ver nosso tabloide de ofertas 📰
6. Horário de funcionamento 🕒
7. Encerrar atendimento ❌

### Fluxo de pedido
- O cliente informa produtos um a um no formato "Produto - Quantidade"
- Quando finaliza a lista, escolhe forma de pagamento
- Opcionalmente informa CPF para nota fiscal
- Pedido é salvo com status "pendente" para revisão da equipe
- A equipe pode contatar o cliente diretamente pelo painel

## 🛠️ Tecnologias

- **Backend:**
  - Node.js
  - Express.js
  - WhatsApp Web.js
  - SQLite3
  - QRCode Terminal
- **Frontend:**
  - Vue.js 3
  - Axios
  - CSS3 responsivo

## 📁 Estrutura do Projeto

```
/src                    # Core do chatbot
├── index.js            # Ponto de entrada principal
├── chatbot.js          # Lógica central do bot
├── menuHandler.js      # Tratamento das opções de menu
├── timeoutManager.js   # Gerenciador de timeout
├── timeoutService.js   # Serviço de timeout
├── pedidoService.js    # Serviço de pedidos (SQLite)
├── utils.js            # Funções utilitárias
├── constants.js        # Constantes e mensagens
└── db.sqlite           # Banco de dados

/web-app                # Backend do painel admin
├── server.js           # Servidor Express (API)
└── package.json        # Dependências do backend

/frontend               # Painel administrativo 
├── src/
│   ├── App.vue         # Interface principal
│   └── main.js         # Inicialização Vue
└── package.json        # Dependências do frontend

/logs                   # Logs do sistema (criados automaticamente)
```

## 📝 Banco de Dados

O bot utiliza SQLite para armazenar os pedidos. A tabela `pedidos` contém:

- **id**: ID do pedido (autoincremental)
- **cliente**: Nome/identificador do cliente
- **telefone**: Número do telefone (para contato direto via WhatsApp)
- **itens**: Lista de produtos e quantidades (JSON)
- **pagamento**: Forma de pagamento escolhida
- **cpf**: CPF para nota fiscal (opcional)
- **status**: Estado do pedido (pendente/confirmado)
- **data_criacao**: Data e hora do recebimento

## 🌐 Recursos de Rede

O sistema é configurado para ser acessível de qualquer dispositivo na mesma rede local:

- O servidor web mostra os IPs disponíveis no console ao iniciar
- O frontend Vue é servido com `--host 0.0.0.0` para aceitar conexões externas
- Os IPs da rede são exibidos no console para facilitar o acesso

## 💡 Dicas e Observações

- Sempre inicie o bot antes do backend e frontend para garantir o fluxo correto
- O QR Code só aparece na primeira conexão ou se perder a sessão
- O painel web atualiza os pedidos automaticamente a cada 10 segundos
- Os números de telefone são formatados automaticamente e incluem botão direto para WhatsApp
- Para reiniciar o banco de dados, basta apagar o arquivo `src/db.sqlite`

## 🔒 Tratamento de Erros

O sistema inclui:
- Tratamento de desconexões do WhatsApp com reconexão automática
- Log de erros em arquivo para diagnóstico
- Validação de entrada de dados pelo usuário
- Timeout automático por inatividade (5 minutos)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Gabriel Alencar

## 📞 Contato

- Email: gabrielalencardearaujo04@exemplo.com
- GitHub: [@alencarrgabriel](https://github.com/alencarrgabriel)

---
⭐️ Desenvolvido com ❤️ para o Supermercado Eta 

[
](https://github.com/user-attachments/assets/ae33e99a-4122-4ebb-b35d-78806666f3cc)

![Image](https://github.com/user-attachments/assets/cb61df0b-f9e5-49eb-8c74-28d90222b1a3)
![Image](https://github.com/user-attachments/assets/7a32ba5a-62bf-48fd-bc2a-f79e56121e55)
![Image](https://github.com/user-attachments/assets/d06f2482-7147-4e24-b882-53f19b212356)
![Image](https://github.com/user-attachments/assets/1dc8698d-30b9-4fe8-8838-23331514275f)
