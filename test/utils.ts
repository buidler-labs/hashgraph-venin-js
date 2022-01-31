import * as fs from 'fs';
import * as path from 'path';
import { ApiSession } from '../lib/ApiSession';
import { LiveContract } from '../lib/live/LiveContract';
import { Contract } from '../lib/static/upload/Contract';

export type ResouorceReadOptions = { relativeTo?: string, contract?: string, solo?: string };

export function read({ relativeTo = 'general', contract, solo }: ResouorceReadOptions) {
    if (undefined != contract) {
        return fs.readFileSync(path.join(__dirname, `${relativeTo}/contracts`, `${contract}.sol`), 'utf8');
    } else {
        return require(`./${relativeTo}/solos/${solo}.json`);
    }
}

export async function load(liveContractPath: string, relativeTo: string = 'general'): Promise<LiveContract> {
    const hapiSession = await ApiSession.default();
    const sbeContract = await Contract.newFrom({ code: read({ contract: liveContractPath, relativeTo }) });
    
    return await hapiSession.upload(sbeContract);
}