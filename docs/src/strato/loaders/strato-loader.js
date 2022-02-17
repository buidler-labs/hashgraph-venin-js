import('./hedera-strato.js').then(({ ApiSession, Contract }) => {
    window.ApiSession = ApiSession;
    window.Contract = Contract;
});