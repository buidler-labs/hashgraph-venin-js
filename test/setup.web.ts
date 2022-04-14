import { Crypto } from '@peculiar/webcrypto';

// Resolves https://github.com/jsdom/jsdom/issues/1612
//    which affects ECSDA key generation in the elliptic library
window.crypto = new Crypto();
