import {
  describe, 
  expect, 
  it,
  jest,
} from '@jest/globals';
import { Interface } from '@ethersproject/abi';

describe('ContractRegistry', () => {
  it("a non-default contract-registry without recursion should extract the expected contract references", async () => {
    const contractRegistry = await loadContractRegistry('test/general/contracts/registry', false, false);
    
    expect(contractRegistry).toBeDefined();
    expect(Object.values(contractRegistry)).toHaveLength(1);
    expect(contractRegistry.a).toBeInstanceOf(Promise);

    const AInterface = await contractRegistry.a;

    expect(Interface.isInterface(AInterface)).toBeTruthy();
    expect(AInterface).toEqual(new Interface([ 'function theNumber() pure returns (uint256)' ]));
  });

  it("generating the default contract-registry without recursion should extract the expected contract references", async () => {
    const defaultContractRegistry = await loadContractRegistry('test/general/contracts/registry', false);
    
    expect(defaultContractRegistry).toBeDefined();
    expect(Object.values(defaultContractRegistry)).toHaveLength(1);
    expect(defaultContractRegistry.a).toBeInstanceOf(Promise);

    const AInterface = await defaultContractRegistry.a;

    expect(Interface.isInterface(AInterface)).toBeTruthy();
    expect(AInterface).toEqual(new Interface([ 'function theNumber() pure returns (uint256)' ]));
  });

  it("generating the default contract-registry with recursion should extract the expected contract references", async () => {
    const defaultContractRegistry = await loadContractRegistry('./test/general/contracts/registry', true);
    
    expect(defaultContractRegistry).toBeDefined();
    expect(Object.values(defaultContractRegistry)).toHaveLength(2);
    expect(defaultContractRegistry.a).toBeInstanceOf(Promise);
    expect(defaultContractRegistry['inner/b']).toBeInstanceOf(Promise);

    const AInterface = await defaultContractRegistry.a;
    const BInterface = await defaultContractRegistry['inner/b'];

    expect(Interface.isInterface(AInterface)).toBeTruthy();
    expect(AInterface).toEqual(new Interface([ 'function theNumber() pure returns (uint256)' ]));
    expect(Interface.isInterface(BInterface)).toBeTruthy();
    expect(BInterface).toEqual(new Interface([ 'function add(uint256 a, uint256 b) pure returns (uint256)' ]));
  });
});

async function loadContractRegistry(path: string, recurse: boolean, returnDefault = true) {
  const originalContractsRelativePathEnv = process.env.HEDERAS_CONTRACTS_RELATIVE_PATH;
  const originalContractRegistryRecurseEnv = process.env.HEDERAS_CONTRACT_REGISTRY_RECURSE;

  process.env.HEDERAS_CONTRACTS_RELATIVE_PATH = path;
  process.env.HEDERAS_CONTRACT_REGISTRY_RECURSE = `${recurse}`;

  const { default: defaultContractRegistry, ContractRegistry } = await import('../../../lib/ContractRegistry');
  const toReturn = returnDefault ? defaultContractRegistry : new ContractRegistry(path, recurse);

  jest.resetModules();
  process.env.HEDERAS_CONTRACTS_RELATIVE_PATH = originalContractsRelativePathEnv;
  process.env.HEDERAS_CONTRACT_REGISTRY_RECURSE = originalContractRegistryRecurseEnv;

  return toReturn;
}
