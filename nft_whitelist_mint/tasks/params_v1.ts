import { ethers } from "ethers";

export const NFT_NAME = "Autoverse Game Beta Pass";
export const NFT_SYMBOL = "AOTUVERSE";
export const MAX_SUPPLY = 200;
export const URI_PREFIX = "https://ipfs.io/ipfs/QmXmZtkJNQRRc2YGCDUp3gsRXdG442VMDswbooaDyvS2Hx/";

function getTimestampFromDate(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

// Public mint schedule
export const START_TIME = getTimestampFromDate(new Date());
export const END_TIME = getTimestampFromDate(new Date("2100-01-01T00:00:00Z"));
export const MINT_PRICE = ethers.utils.parseEther("10"); // 10 MATIC
export const MINT_AMOUNT = 200; // 0: Infinite, > 0: Public mint total amount
export const MAX_PER_USER = 0; // 0: Infinite, > 0: Max amount
export const ERC20_TOKEN = ethers.constants.AddressZero; // ERC20 Token address (Not set)
export const ERC20_AMOUNT = 0; // ERC20 Token amount
