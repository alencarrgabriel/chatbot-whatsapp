<template>
  <div class="app">
    <header class="header">
      <h1>Pedidos do Supermercado Eta</h1>
      <div class="status" :class="{ 'status-online': !erro }">
        {{ erro ? 'Offline' : 'Online' }}
      </div>
    </header>

    <div class="container">
      <div v-if="carregando" class="loading">
        <div class="spinner"></div>
        <p>Carregando pedidos...</p>
      </div>

      <div v-else-if="erro" class="error">
        <p>{{ erro }}</p>
        <button @click="carregarPedidos" class="retry-button">
          Tentar novamente
        </button>
      </div>

      <div v-else-if="pedidos.length === 0" class="empty-state">
        <p>Nenhum pedido encontrado</p>
      </div>

      <div v-else class="pedidos-grid">
        <div v-for="pedido in pedidos" :key="pedido.id" class="pedido-card">
          <div class="pedido-header">
            <h3>Pedido #{{ pedido.id }}</h3>
            <span class="status-badge" :class="pedido.status">
              {{ pedido.status }}
            </span>
          </div>

          <div class="pedido-info">
            <p><strong>Cliente:</strong> {{ pedido.cliente }}</p>
            <p>
              <strong>Telefone:</strong> 
              <span v-if="pedido.telefone">{{ formatarTelefone(pedido.telefone) }}</span>
              <span v-else>Não disponível</span>
              <a v-if="pedido.telefone" 
                 :href="'https://wa.me/' + getNumeroLimpo(pedido.telefone)" 
                 target="_blank" 
                 class="whatsapp-link"
                 title="Abrir no WhatsApp">
                <i class="whatsapp-icon">📱</i>
              </a>
            </p>
            <p v-if="pedido.cpf"><strong>CPF:</strong> {{ pedido.cpf }}</p>
            <p><strong>Pagamento:</strong> {{ pedido.pagamento }}</p>
            <p><strong>Data/Hora:</strong> {{ formatarData(pedido.dataHora) }}</p>
          </div>

          <div class="itens">
            <h4>Produtos:</h4>
            <ul>
              <li v-for="(item, index) in pedido.itens" :key="index">
                {{ item }}
              </li>
            </ul>
            <div class="botoes-pedido">
              <button class="finalizar-btn" @click="finalizarPedido(pedido.id)">Finalizar pedido</button>
              <button class="contatar-btn" @click="contatarCliente(pedido.telefone)">Contatar cliente</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return {
      pedidos: [],
      carregando: true,
      erro: null,
      pollingInterval: null
    };
  },
  methods: {
    getNumeroLimpo(telefone) {
      if (!telefone) return '';
      return telefone.replace('@c.us', '').replace(/\D+/g, ''); // Remove tudo que não for dígito
    },
    formatarTelefone(telefone) {
      if (!telefone) return '';
      // Remove a parte @c.us do número do WhatsApp
      let numero = this.getNumeroLimpo(telefone);
      
      // Formata o número brasileiro (ex: 55 61 98765-4321)
      if (numero.startsWith('55') && numero.length >= 12) {
        return `+${numero.substring(0, 2)} ${numero.substring(2, 4)} ${numero.substring(4, 9)}-${numero.substring(9)}`;
      }
      
      return numero;
    },
    formatarData(dataString) {
      if (!dataString) return '';
      
      try {
        const data = new Date(dataString);
        return data.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        console.error('Erro ao formatar data:', e);
        return dataString;
      }
    },
    contatarCliente(telefone) {
      if (!telefone) {
        alert('Número de telefone não disponível');
        return;
      }
      
      // Remove a parte @c.us do número do WhatsApp
      let numero = this.getNumeroLimpo(telefone);
      
      // Verificar se é um número válido
      if (!numero || !numero.match(/^\d+$/)) {
        console.error('Número de telefone inválido:', numero);
        alert('Número de telefone inválido ou não formatado corretamente');
        return;
      }
      
      console.log('Tentando abrir WhatsApp com número:', numero);
      
      // Criar um elemento <a> temporário para simular um clique em um link
      const link = document.createElement('a');
      link.href = `https://wa.me/${numero}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Mostrar um feedback visual para o usuário
      setTimeout(() => {
        alert(`Abrindo WhatsApp para o número: ${numero}`);
      }, 500);
    },
    async carregarPedidos() {
      this.carregando = true;
      this.erro = null;
      try {
        // Usar URL relativa ou baseada no host atual
        const apiUrl = `/api/pedidos`;
        const response = await axios.get(apiUrl);
        console.log('Dados recebidos:', response.data);
        
        this.pedidos = response.data.map(pedido => {
          console.log('Processando pedido:', pedido);
          
          // Garantir que temos os campos necessários com valores padrão
          let itens = [];
          try {
            itens = typeof pedido.itens === 'string' ? JSON.parse(pedido.itens) : pedido.itens;
          } catch (e) {
            console.error('Erro ao processar itens:', e);
            itens = [];
          }
          
          return {
            id: pedido.id || 0,
            cliente: pedido.cliente || 'Cliente não identificado',
            telefone: pedido.telefone || null,
            itens: Array.isArray(itens) ? itens : [],
            pagamento: pedido.pagamento || 'Não informado',
            cpf: pedido.cpf || 'Não informado',
            dataHora: pedido.dataHora || pedido.data || new Date().toISOString(),
            status: pedido.status || 'pendente'
          };
        });
        
        console.log('Pedidos processados:', this.pedidos);
      } catch (error) {
        this.erro = 'Erro ao carregar pedidos. Verifique se o servidor está rodando.';
        console.error('Erro:', error);
      } finally {
        this.carregando = false;
      }
    },
    async finalizarPedido(id) {
      if (!confirm('Tem certeza que deseja finalizar e remover este pedido?')) return;
      try {
        await axios.delete(`http://localhost:3000/api/pedidos/${id}`);
        this.pedidos = this.pedidos.filter(p => p.id !== id);
      } catch (error) {
        alert('Erro ao finalizar pedido. Tente novamente.');
        console.error('Erro ao deletar pedido:', error);
      }
    }
  },
  mounted() {
    this.carregarPedidos();
    this.pollingInterval = setInterval(this.carregarPedidos, 10000);
  },
  beforeUnmount() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
};
</script>

<style>
:root {
  --primary-color: #2e4053;
  --secondary-color: #3498db;
  --success-color: #2ecc71;
  --error-color: #e74c3c;
  --background-color: #f5f6fa;
  --card-background: #ffffff;
  --text-color: #2c3e50;
  --border-radius: 8px;
  --spacing: 16px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
}

.app {
  min-height: 100vh;
}

.header {
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  background-color: var(--error-color);
}

.status-online {
  background-color: var(--success-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--secondary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: var(--spacing);
  color: var(--error-color);
}

.retry-button {
  margin-top: var(--spacing);
  padding: 8px 16px;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #2980b9;
}

.empty-state {
  text-align: center;
  padding: var(--spacing);
  color: #666;
}

.pedidos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing);
}

.pedido-card {
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  padding: var(--spacing);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.pedido-card:hover {
  transform: translateY(-2px);
}

.pedido-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing);
  padding-bottom: var(--spacing);
  border-bottom: 1px solid #eee;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.confirmado {
  background-color: var(--success-color);
  color: white;
}

.status-badge.pendente {
  background-color: #f39c12;
  color: white;
}

.pedido-info {
  margin-bottom: var(--spacing);
}

.itens {
  background-color: #f8f9fa;
  padding: var(--spacing);
  border-radius: var(--border-radius);
}

.itens ul {
  list-style: none;
}

.itens li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.itens li:last-child {
  border-bottom: none;
}

.finalizar-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #ef0b0b;
  color: #fff;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.finalizar-btn:hover {
  background-color: #b30000;
}

.contatar-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
  margin-left: 8px;
}

.contatar-btn:hover {
  background-color: #2980b9;
}

.botoes-pedido {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.whatsapp-link {
  text-decoration: none;
  margin-left: 8px;
  color: #25D366; /* Cor do WhatsApp */
  font-size: 18px;
}

.whatsapp-link:hover {
  opacity: 0.8;
}

.whatsapp-icon {
  font-size: 18px;
}
</style> 