export * from './index.native';

// ContractRegistry is a synthetic object which is generated at bundle-time
// see: https://github.com/buidler-labs/hedera-strato-js/issues/22
//
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export { default as ContractRegistry } from './ContractRegistry';
