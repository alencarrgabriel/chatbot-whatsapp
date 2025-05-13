const timeoutManager = require('./timeoutManager');
const { log } = require('./utils');

function resetarTimeout(client, userId) {
    timeoutManager.resetTimeout(client, userId);
    log('INFO', 'Timeout resetado', { userId });
}

function limparTimeout(userId) {
    timeoutManager.clearTimeout(userId);
}

function temTimeout(userId) {
    return timeoutManager.hasTimeout(userId);
}

module.exports = {
    resetarTimeout,
    limparTimeout,
    temTimeout
}; 