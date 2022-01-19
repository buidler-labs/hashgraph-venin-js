import * as fs from 'fs';
import * as path from 'path';
import { HederaNetwork } from '../lib/HederaNetwork';
import { LiveContract } from '../lib/live/LiveContract';
import { Contract } from '../lib/static/Contract';

export type ResouorceReadOptions = { relativeTo?: string, contract?: string, solo?: string };

export function read({ relativeTo = 'general', contract, solo }: ResouorceReadOptions) {
    if (undefined != contract) {
        return fs.readFileSync(path.join(__dirname, `${relativeTo}/contracts`, `${contract}.sol`), 'utf8');
    } else {
        return require(`./${relativeTo}/solos/${solo}.json`);
    }
}

export async function load(liveContractPath: string, relativeTo: string = 'general'): Promise<LiveContract> {
    const hapiSession = await HederaNetwork.defaultApiSession();
    const sbeContract = await Contract.newFrom({ code: read({ contract: liveContractPath, relativeTo }) });
    
    return await hapiSession.upload(sbeContract);
}