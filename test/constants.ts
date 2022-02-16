
import { Hbar, TokenSupplyType, TokenType } from "@hashgraph/sdk";

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

export const GasFees = {
  // Taken from 'Precompile Gas Costs' @ https://hips.hedera.com/hip/hip-206
  associateToken: new Hbar(0.015),
  burnToken: new Hbar(0.015),
  dissociateToken: new Hbar(0.015),
  mintToken: new Hbar(0.015),
  transferToken: new Hbar(0.015),
};
