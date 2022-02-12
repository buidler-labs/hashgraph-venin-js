
import { TokenSupplyType, TokenType } from "@hashgraph/sdk";
import { KeyType } from "../lib/static/create/Account";

import type { AccountFeatures } from "../lib/static/create/Account";
import type { TokenFeatures } from "../lib/static/create/Token";

export const defaultEd25519AccountFeatures: AccountFeatures = {
  generateKey: true,
  keyType: KeyType.ED25519,
  maxAutomaticTokenAssociations: 2
}

export const defaultFungibleTokenFeatures: TokenFeatures = {
  decimals: 0,
  initialSupply: 1000,
  keys: {
    kyc: null
  },
  name: "hbarRocks",
  symbol: "HROK",
  type: TokenType.FungibleCommon
}

export const defaultNonFungibleTokenFeatures: TokenFeatures = {
  decimals: 0,
  initialSupply: 0,
  keys: {
    kyc: null
  },
  maxSupply: 10,
  name: "hbarRocks",
  supplyType: TokenSupplyType.Finite,
  symbol: "HROKs",
  type: TokenType.NonFungibleUnique
};