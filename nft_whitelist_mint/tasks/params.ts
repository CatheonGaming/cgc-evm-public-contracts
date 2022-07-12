import { ethers } from "ethers";

export const NFT_NAME = "ONIGIRI NFT";
export const NFT_SYMBOL = "ONIGIRI";
export const MAX_SUPPLY = 100;
export const URI_PREFIX = "https://ipfs.io/ipfs/QmZegrFAf9KXK6D4ZjMkq6uTmNuiN1ChJg6ecvgBKV8vWK/";
export const PUBLIC_MINT_PRICE = ethers.utils.parseEther("0.1");

function getTimestampFromDate(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

// Whitelist mint schedule 1
export const MERKLE_ROOT1 = "0xeba5f4767e6818b2a67678d9e55ecc2a8f2127e88f6c83f604a52b141d7f86a9";
export const START_TIME1 = getTimestampFromDate(new Date("12/07/2022 03:45:00"));
export const END_TIME1 = getTimestampFromDate(new Date("12/07/2022 04:00:00"));
export const MINT_PRICE1 = ethers.utils.parseEther("0.05");

// Public mint schedule
