const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutos
const userTimeouts = {};

function resetarTimeout(userId) {
    if (userTimeouts[userId]) {
        clearTimeout(userTimeouts[userId]);
    }

    userTimeouts[userId] = setTimeout(() => {
        delete userTimeouts[userId];
    }, TIMEOUT_DURATION);
}

function limparTimeout(userId) {
    if (userTimeouts[userId]) {
        clearTimeout(userTimeouts[userId]);
        delete userTimeouts[userId];
    }
}

module.exports = {
    resetarTimeout,
    limparTimeout
}; 