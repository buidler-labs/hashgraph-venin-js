export interface SolidityAddressable {
    getSolidityAddress(): Promise<string>;
}

export function isSolidityAddressable(arg: any): arg is SolidityAddressable {
    return arg && arg.getSolidityAddress && typeof(arg.getSolidityAddress) === 'function';
}