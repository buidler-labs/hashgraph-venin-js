import { Hbar } from "@hashgraph/sdk";

export const GasFees = {
  // Taken from 'Precompile Gas Costs' @ https://hips.hedera.com/hip/hip-206
  associateToken: new Hbar(0.015),
  burnToken: new Hbar(0.015),
  dissociateToken: new Hbar(0.015),
  mintToken: new Hbar(0.02),
  transferToken: new Hbar(0.015),
};

export const VALID_AUTO_RENEW_IN_SECONDS = 6999999;
