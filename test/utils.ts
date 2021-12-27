import * as fs from 'fs';
import * as path from 'path';
import { HederaNetwork } from '../lib/HederaNetwork';
import { LiveContract } from '../lib/live/LiveContract';
import { Contract } from '../lib/static/Contract';

export function read({ contract, solo }: { contract?: string, solo?: string }) {
    if (undefined != contract) {
        return fs.readFileSync(path.join(__dirname, 'resources/contracts/sources', `${contract}.sol`), 'utf8');
    } else {
        return require(`./resources/contracts/solos/${solo}.json`);
    }
}

export async function load(liveContractPath: string): Promise<LiveContract> {
    const hapiSession = await HederaNetwork.defaultApiSession();
    const sbeContract = await Contract.newFrom({ code: read({ contract: liveContractPath }) });
    
    return await hapiSession.upload(sbeContract);
}