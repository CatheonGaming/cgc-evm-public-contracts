import { ethers } from "ethers";

export const NFT_NAME = "Onigiri Metaverse";
export const NFT_SYMBOL = "ONIGIRI";
export const MAX_SUPPLY = 3000;
export const URI_PREFIX = "https://api.onigirimetaverse.com/nft/";

function getTimestampFromDate(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

// Whitelist mint schedule (Phase1)
export const MERKLE_ROOT1 = "0x0718aaad465d4061f109d77b00c93b9b776f44b5f61cbeb11d779ba5ee7ed8c6";
export const START_TIME1 = getTimestampFromDate(new Date("2022-08-03T14:30:00Z"));
export const END_TIME1 = getTimestampFromDate(new Date("2022-08-03T14:55:00Z"));
export const MINT_PRICE1 = ethers.utils.parseEther("0.02"); // 0.02ETH
export const MINT_AMOUNT1 = 150; // 0: Infinite, > 0: Merkle total amount

// Whitelist mint schedule (Phase2)
export const MERKLE_ROOT2 = "0x0718aaad465d4061f109d77b00c93b9b776f44b5f61cbeb11d779ba5ee7ed8c6";
export const START_TIME2 = getTimestampFromDate(new Date("2022-08-03T15:00:00Z"));
export const END_TIME2 = getTimestampFromDate(new Date("2022-08-03T15:25:00Z"));
export const MINT_PRICE2 = ethers.utils.parseEther("0.025"); // 0.025ETH
export const MINT_AMOUNT2 = 300; // 0: Infinite, > 0: Merkle total amount

// Public mint schedule (Phase3)
export const START_TIME3 = getTimestampFromDate(new Date("2022-08-03T15:30:00Z"));
export const END_TIME3 = getTimestampFromDate(new Date("2022-08-04T15:30:00Z"));
export const MINT_PRICE3 = ethers.utils.parseEther("0.03"); // 0.03ETH
export const MINT_AMOUNT3 = 2350; // 0: Infinite, > 0: Public mint total amount
export const MAX_PER_USER3 = 0; // 0: Infinite, > 0: Max amount
