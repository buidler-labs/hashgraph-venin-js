import * as fs from "fs";
import * as path from "path";

import { PrivateKey } from "@hashgraph/sdk";
import elliptic from "elliptic";
import nacl from "tweetnacl";

import {
  CreateTokenFeatures,
  Token,
  TokenType,
  TokenTypes,
} from "../lib/static/create/Token";
import { ApiSession } from "../lib/ApiSession";
import { Contract } from "../lib/static/upload/Contract";
import { ContractRegistry } from "../lib/ContractRegistry";
import { KeyType } from "../lib/static/create/Account";
import { LiveContract } from "../lib/live/LiveContract";

export type ResourceReadOptions = {
  relativeTo?: string;
  contract?: string;
  solo?: string;
};

const derPrefix = "3030020100300706052b8104000a04220420";
const derPrefixBytes = Buffer.from(derPrefix, "hex");
const secp256k1 = new elliptic.ec("secp256k1");

export function read({
  relativeTo = "general",
  contract,
  solo,
}: ResourceReadOptions) {
  if (undefined != contract) {
    return fs.readFileSync(
      path.join(__dirname, `${relativeTo}/contracts`, `${contract}.sol`),
      "utf8"
    );
  } else {
    return require(`./${relativeTo}/solos/${solo}.json`);
  }
}

export async function load(
  liveContractPath: string,
  relativeTo = "general"
): Promise<LiveContract> {
  const { session } = await ApiSession.default();
  const sbeContract = await Contract.newFrom({
    code: read({ contract: liveContractPath, relativeTo }),
  });

  return await session.upload(sbeContract);
}

export function loadContractRegistry(
  relativeTo = "general",
  recurse = true
): ContractRegistry {
  const contractsPath = path.join(__dirname, `${relativeTo}/contracts`);

  return new ContractRegistry(contractsPath, recurse);
}

export function getTokenToTest(
  featureOverrides: Partial<CreateTokenFeatures> = {},
  tokenType: TokenType = TokenTypes.FungibleCommon,
  useSessionKeyForKyc = true
) {
  const tokenFeatures = Object.assign(
    {
      decimals: 0,
      freezeDefault: false,
      initialSupply: tokenType.equals(TokenTypes.FungibleCommon) ? 1000 : 0,
      name: "hbarRocks",
      symbol: "HROK",
      type: tokenType,
    },
    featureOverrides,
    useSessionKeyForKyc ? {} : { keys: { kyc: null } }
  );

  return new Token(tokenFeatures);
}

export function getKeyTypeFor(privateKey: PrivateKey): KeyType {
  let keyTypeToReturn = KeyType.Unknown;
  const keyBytes = privateKey.toBytes();

  // Check ED25519
  try {
    switch (keyBytes.length) {
      case 32:
        nacl.sign.keyPair.fromSeed(keyBytes);
        keyTypeToReturn = KeyType.ED25519;
        break;
      case 64:
        nacl.sign.keyPair.fromSecretKey(keyBytes);
        keyTypeToReturn = KeyType.ED25519;
        break;
    }
  } catch (e) {
    // No-op
  }

  if (keyTypeToReturn === KeyType.Unknown) {
    // Does not look to be an ED25519 key
    // Try ECSDA
    if (keyBytes.length == 50 && arrayStartsWith(keyBytes, derPrefixBytes)) {
      secp256k1.keyFromPrivate(keyBytes.subarray(derPrefixBytes.length));
      keyTypeToReturn = KeyType.ECDSA;
    }
  }
  return keyTypeToReturn;
}

function arrayStartsWith(array, arrayPrefix) {
  if (array.byteLength < arrayPrefix.byteLength) {
    return false;
  }

  let i = arrayPrefix.byteLength;

  while (i--) {
    if (array[i] !== arrayPrefix[i]) {
      return false;
    }
  }
  return true;
}
