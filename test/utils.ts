import * as fs from 'fs';
import * as path from 'path';

export function read({ contract, solo }: { contract?: string, solo?: string }) {
    if (undefined != contract) {
        return fs.readFileSync(path.join(__dirname, 'resources/contracts/sources', `${contract}.sol`), 'utf8');
    } else {
        return require(`./resources/contracts/solos/${solo}.json`);
    }
}