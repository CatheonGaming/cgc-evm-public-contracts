import { ethers } from "ethers";

export const NFT_NAME = "Onigiri Metaverse NFT";
export const NFT_SYMBOL = "ONI";
export const MAX_SUPPLY = 3000;
export const URI_PREFIX = "https://dev-api.onigirimetaverse.com/nft/";

function getTimestampFromDate(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

// Whitelist mint schedule
export const MERKLE_ROOT1 = "0x0718aaad465d4061f109d77b00c93b9b776f44b5f61cbeb11d779ba5ee7ed8c6";
export const START_TIME1 = getTimestampFromDate(new Date("2022-08-01T05:00:00Z"));
export const END_TIME1 = getTimestampFromDate(new Date("2022-08-02T00:00:00Z"));
export const MINT_PRICE1 = ethers.utils.parseEther("0.025"); // 0.01ETH
export const MERKLE_TOTAL = 0; // 0: Infinite, > 0: Merkle total amount

// Public mint schedule
export const START_TIME2 = getTimestampFromDate(new Date("2022-08-01T16:40:00Z"));
export const END_TIME2 = getTimestampFromDate(new Date("2022-08-02T00:00:00Z"));
export const MINT_PRICE2 = ethers.utils.parseEther("0.03"); // 0.01ETH
export const MINT_AMOUNT2 = 0; // 0: Infinite, > 0: Public mint total amount
export const MAX_PER_USER = 0; // 0: Infinite, > 0: Max amount
