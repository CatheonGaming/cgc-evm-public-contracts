import { ethers as hEthers } from "hardhat";

export function parseWithDecimals(amount: number, decimals: number) {
  return hEthers.utils.parseUnits(Math.floor(amount).toString(), decimals);
}

export const TOKEN_NAME = "CATHEON TOKEN";
export const TOKEN_SYMBOL = "CATHEON";
export const INITIAL_SUPPLY = 1000_000_000;
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
