import { ethers } from "ethers";

export const NFT_NAME = "3000 KINGS";
export const NFT_SYMBOL = "3KN";
export const MAX_SUPPLY = 100;
export const URI_PREFIX = "https://ipfs.io/ipfs/QmbpTCy1KoUz2E2pV5zrMafZzgfwFS9mRWRFzyRYQ9vuNo/";

function getTimestampFromDate(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

// Whitelist mint schedule 1
export const MERKLE_ROOT1 = "0x93efe2dd21e75ef7fd7aa0258254724645b7e134e8587aa37ab72e855ef4ef23";
export const START_TIME1 = getTimestampFromDate(new Date("2022-07-19T00:00:00Z"));
export const END_TIME1 = getTimestampFromDate(new Date("2022-07-20T12:00:00Z"));
export const MINT_PRICE1 = ethers.utils.parseEther("0.01");
export const MERKLE_TOTAL = 30;

// Public mint schedule
export const START_TIME2 = getTimestampFromDate(new Date("2022-07-14T12:00:00Z"));
export const END_TIME2 = getTimestampFromDate(new Date("2022-07-20T12:00:00Z"));
export const MINT_PRICE2 = ethers.utils.parseEther("0.1");
export const MINT_AMOUNT2 = 10;
