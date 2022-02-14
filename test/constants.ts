
import { TokenSupplyType, TokenType } from "@hashgraph/sdk";

import type { TokenFeatures } from "../lib/static/create/Token";

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