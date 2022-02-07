// This script does the following:
//  1. Logs to portal.hedera.com (via process.env.PORTAL_EMAIL & process.env.PORTAL_PASSWORD)
//  2. Retrieves the test account for the desired process.env.PORTAL_NETWORK network (testnet/previewnet)
//  3. Triggers "npm run test:node" using that account

import axios from 'axios';
import { spawn } from 'child_process';

if (!process.env.PORTAL_EMAIL || !process.env.PORTAL_PASSWORD || !process.env.PORTAL_NETWORK) {
    throw new Error("Please set PORTAL_EMAIL, PORTAL_PASSWORD and PORTAL_NETWORK to be able to run on official networks.");
}

const network = process.env.PORTAL_NETWORK;

if (network !== 'testnet' && network !== 'previewnet') {
    throw new Error("PORTAL_NETWORK can only be 'testnet' or 'previewnet'.");
}

// Login to Hedera Portal and lock onto the assigned credentials for the desired network
const tokenResponse = await axios.post('https://api.portal.hedera.com/v1/token', {
    email: process.env.PORTAL_EMAIL,
    password: process.env.PORTAL_PASSWORD
});
const cookie = tokenResponse.headers['set-cookie'][0];
const meResponse = await axios.get('https://api.portal.hedera.com/v1/user/me', { headers: { cookie } });
const me = meResponse.data;
const networkOfInterest = me.networks.find(checkedNetwork => checkedNetwork.label === network);
const accountResponse = await axios.get(`https://api.portal.hedera.com/v1/testnet/${networkOfInterest.id}/account`, {
    headers: { cookie }
});
const { accountId, privateKey } = accountResponse.data;

// // Run the test
console.log(`Running test:node for account '${accountId}' on the '${network}' network.`);
const jestProcess = spawn('npm', ['run', 'test:node'], {
    env: {
        ...process.env,
        HEDERAS_NETWORK: network,
        HEDERAS_OPERATOR_ID: accountId,
        HEDERAS_OPERATOR_KEY: privateKey
    }
});

jestProcess.stdout.on('data', (data) => {
    console.log(`${data}`);
});
jestProcess.stderr.on('data', (data) => {
    console.error(`${data}`);
});