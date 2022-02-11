
import { TokenSupplyType, TokenType } from "@hashgraph/sdk";
import { Token } from "../lib/static/create/Token";

export const defaultNonFungibleTokenSpecs = {
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