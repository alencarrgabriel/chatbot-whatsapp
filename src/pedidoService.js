const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { log } = require('./utils');

// Caminho do banco de dados
const dbPath = path.join(__dirname, 'db.sqlite');
log('INFO', `Tentando conectar ao banco de dados em: ${dbPath}`);

// Inicializa o banco de dados
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

// Função para migrar pedidos do JSON para o SQLite
async function migrarPedidosJSON() {
    const jsonPath = path.join(__dirname, '..', 'pedidos_confirmados.json');
    
    if (!fs.existsSync(jsonPath)) {
        log('INFO', 'Arquivo de pedidos JSON não encontrado');
        return;
    }

    try {
        const conteudo = fs.readFileSync(jsonPath, 'utf8');
        const pedidos = JSON.parse(conteudo);
        
        log('INFO', `Encontrados ${pedidos.length} pedidos para migrar`);
        
        for (const pedido of pedidos) {
            await salvarPedido({
                cliente: pedido.cliente,
                itens: pedido.itens,
                pagamento: pedido.pagamento,
                cpf: pedido.cpf,
                status: 'confirmado',
                data_criacao: pedido.data || new Date().toISOString()
            });
        }
        
        log('INFO', 'Migração de pedidos concluída');
    } catch (error) {
        log('ERRO', 'Erro ao migrar pedidos:', error);
    }
}

// Cria a tabela de pedidos se não existir
function setupDatabase() {
    log('INFO', 'Iniciando setup do banco de dados');
    db.run(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente TEXT NOT NULL,
            itens TEXT NOT NULL,
            pagamento TEXT NOT NULL,
            cpf TEXT,
            status TEXT NOT NULL,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            log('ERRO', 'Erro ao criar tabela de pedidos:', err);
        } else {
            log('INFO', 'Tabela de pedidos criada/verificada com sucesso');
            
            // Verifica se a tabela foi criada
            db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='pedidos'", (err, row) => {
                if (err) {
                    log('ERRO', 'Erro ao verificar tabela após criação:', err);
                } else if (!row) {
                    log('ERRO', 'Tabela pedidos não encontrada após criação');
                } else {
                    log('INFO', 'Tabela pedidos confirmada após criação');
                }
            });
        }
    });
}

// Salva um novo pedido
async function salvarPedido(pedido) {
    try {
        const { cliente, itens, pagamento, cpf, status = 'pendente', data_criacao } = pedido;
        log('DEBUG', 'Tentando salvar pedido:', pedido);
        const stmt = db.prepare(`
            INSERT INTO pedidos (cliente, itens, pagamento, cpf, status, data_criacao)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        return new Promise((resolve, reject) => {
            stmt.run(
                cliente,
                JSON.stringify(itens),
                pagamento,
                cpf || null,
                status,
                data_criacao || new Date().toISOString(),
                function(err) {
                    if (err) {
                        log('ERRO', 'Erro ao salvar pedido:', err);
                        reject(err);
                    } else {
                        log('INFO', 'Pedido salvo com sucesso', { id: this.lastID, ...pedido });
                        db.get('SELECT * FROM pedidos WHERE id = ?', [this.lastID], (err, row) => {
                            if (err) {
                                log('ERRO', 'Erro ao verificar pedido salvo:', err);
                            } else if (!row) {
                                log('ERRO', 'Pedido não encontrado após salvar');
                            } else {
                                log('INFO', 'Pedido confirmado no banco de dados:', row);
                            }
                        });
                        resolve(this.lastID);
                    }
                }
            );
            stmt.finalize();
        });
    } catch (error) {
        log('ERRO', 'Erro ao salvar pedido:', error);
        throw error;
    }
}

// Busca um pedido pelo ID
function buscarPedido(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM pedidos WHERE id = ?', [id], (err, row) => {
            if (err) {
                log('ERRO', 'Erro ao buscar pedido:', err);
                reject(err);
            } else {
                if (row) {
                    row.itens = JSON.parse(row.itens);
                }
                resolve(row);
            }
        });
    });
}

// Lista todos os pedidos
function listarPedidos() {
    return new Promise((resolve, reject) => {
        log('DEBUG', 'Buscando todos os pedidos');
        db.all('SELECT * FROM pedidos ORDER BY data_criacao DESC', [], (err, rows) => {
            if (err) {
                log('ERRO', 'Erro ao listar pedidos:', err);
                reject(err);
            } else {
                log('DEBUG', 'Pedidos encontrados:', rows);
                rows.forEach(row => {
                    row.itens = JSON.parse(row.itens);
                });
                resolve(rows);
            }
        });
    });
}

// Atualiza o status de um pedido
function atualizarStatus(id, status) {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE pedidos SET status = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id],
            function(err) {
                if (err) {
                    log('ERRO', 'Erro ao atualizar status do pedido:', err);
                    reject(err);
                } else {
                    log('INFO', 'Status do pedido atualizado', { id, status });
                    resolve(this.changes);
                }
            }
        );
    });
}

// Inicializa o banco de dados
setupDatabase();

module.exports = {
    salvarPedido,
    buscarPedido,
    listarPedidos,
    atualizarStatus
}; 