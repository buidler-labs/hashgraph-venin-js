export interface SolidityAddressable {
    getSolidityAddress(): string;
}

export function isSolidityAddressable(arg: any): arg is SolidityAddressable {
    return arg && arg.getSolidityAddress && typeof(arg.getSolidityAddress) === 'function';
}

export function extractSolidityAddressFrom(addr: string) {
    const matchedExp = /(?:0x)?([0-9a-fA-F]{40})/g.exec(addr);

    return matchedExp != undefined ? matchedExp[1] : undefined;
}