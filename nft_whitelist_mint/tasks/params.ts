import { ethers } from "ethers";

export const NFT_NAME = "Onigiri Metaverse NFT";
export const NFT_SYMBOL = "ONI";
export const MAX_SUPPLY = 3000;
export const URI_PREFIX = "https://dev-api.onigirimetaverse.com/nft/";

function getTimestampFromDate(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

// Whitelist mint schedule
export const MERKLE_ROOT1 = "0x88be36133ad52c48aa12241bb3395668b40bc6d4f5c6b897b0006cdd068dceee";
export const START_TIME1 = getTimestampFromDate(new Date("2022-08-01T05:00:00Z"));
export const END_TIME1 = getTimestampFromDate(new Date("2022-08-02T00:00:00Z"));
export const MINT_PRICE1 = ethers.utils.parseEther("0.01"); // 0.01ETH
export const MERKLE_TOTAL = 30; // Merkle total amount

// Public mint schedule
export const START_TIME2 = getTimestampFromDate(new Date("2022-08-01T16:40:00Z"));
export const END_TIME2 = getTimestampFromDate(new Date("2022-08-02T00:00:00Z"));
export const MINT_PRICE2 = ethers.utils.parseEther("0.01"); // 0.01ETH
export const MINT_AMOUNT2 = 20; // Public mint total amount
export const MAX_PER_USER = 0; // 0: Infinite, > 0: Check max
