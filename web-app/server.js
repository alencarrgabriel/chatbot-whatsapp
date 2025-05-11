const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Função para log
function log(tipo, mensagem, dados = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${tipo}] ${mensagem}`;
    
    if (dados) {
        console.log(logMessage, dados);
    } else {
        console.log(logMessage);
    }
}

// Caminho do banco de dados
const dbPath = path.join(__dirname, '..', 'src', 'db.sqlite');
log('INFO', `Tentando conectar ao banco de dados em: ${dbPath}`);

// Conexão com o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        log('ERRO', 'Erro ao conectar ao banco de dados:', err);
    } else {
        log('INFO', 'Conectado ao banco de dados SQLite');
        
        // Verifica se a tabela existe
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='pedidos'", (err, row) => {
            if (err) {
                log('ERRO', 'Erro ao verificar tabela:', err);
            } else if (!row) {
                log('ERRO', 'Tabela pedidos não encontrada');
            } else {
                log('INFO', 'Tabela pedidos encontrada');
            }
        });
    }
});

// Rota para buscar todos os pedidos
app.get('/api/pedidos', (req, res) => {
    log('INFO', 'Recebida requisição GET /api/pedidos');
    
    const query = `
        SELECT 
            id,
            cliente,
            itens,
            pagamento,
            cpf,
            data_criacao as data,
            status
        FROM pedidos 
        ORDER BY data_criacao DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            log('ERRO', 'Erro ao buscar pedidos:', err);
            res.status(500).json({ error: 'Erro ao buscar pedidos' });
            return;
        }

        try {
            // Converte os itens de JSON string para objeto
            const pedidos = rows.map(pedido => {
                log('DEBUG', 'Processando pedido:', pedido);
                return {
                    ...pedido,
                    itens: JSON.parse(pedido.itens)
                };
            });

            log('INFO', `Retornados ${pedidos.length} pedidos`);
            log('DEBUG', 'Pedidos retornados:', pedidos);
            res.json(pedidos);
        } catch (error) {
            log('ERRO', 'Erro ao processar pedidos:', error);
            res.status(500).json({ error: 'Erro ao processar pedidos' });
        }
    });
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        dbPath: dbPath
    });
});

// Rota para deletar um pedido
app.delete('/api/pedidos/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM pedidos WHERE id = ?', [id], function(err) {
        if (err) {
            log('ERRO', 'Erro ao deletar pedido:', err);
            res.status(500).json({ error: 'Erro ao deletar pedido' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Pedido não encontrado' });
        } else {
            log('INFO', `Pedido ${id} removido do banco de dados.`);
            res.json({ success: true });
        }
    });
});

// Inicia o servidor
app.listen(port, () => {
    log('INFO', `Servidor rodando em http://localhost:${port}`);
}); 