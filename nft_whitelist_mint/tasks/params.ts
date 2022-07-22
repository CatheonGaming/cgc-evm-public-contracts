import { ethers } from "ethers";

export const NFT_NAME = "Onigiri Metaverse";
export const NFT_SYMBOL = "ONI";
export const MAX_SUPPLY = 100;
export const URI_PREFIX = "https://ipfs.io/ipfs/QmQbFiHNDddrRD4Tz1baMWoy1ej4GjurBSw282oE2eqXKo/";

function getTimestampFromDate(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

// Whitelist mint schedule
export const MERKLE_ROOT1 = "0x93efe2dd21e75ef7fd7aa0258254724645b7e134e8587aa37ab72e855ef4ef23";
export const START_TIME1 = getTimestampFromDate(new Date("2022-07-22T10:00:00Z"));
export const END_TIME1 = getTimestampFromDate(new Date("2022-07-25T12:00:00Z"));
export const MINT_PRICE1 = ethers.utils.parseEther("0.01"); // 0.01ETH
export const MERKLE_TOTAL = 30; // Merkle total amount

// Public mint schedule
export const START_TIME2 = getTimestampFromDate(new Date("2022-07-23T00:00:00Z"));
export const END_TIME2 = getTimestampFromDate(new Date("2022-07-25T12:00:00Z"));
export const MINT_PRICE2 = ethers.utils.parseEther("0.01"); // 0.01ETH
export const MINT_AMOUNT2 = 20; // Public mint total amount
export const MAX_PER_USER = 2; // 0: Infinite, > 0: Check max
