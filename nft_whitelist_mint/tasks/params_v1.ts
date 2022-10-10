import { ethers } from "ethers";

export const NFT_NAME = "Autoverse Game Beta Pass";
export const NFT_SYMBOL = "AOTUVERSE";
export const MAX_SUPPLY = 200;
export const URI_PREFIX = "https://ipfs.io/ipfs/QmXmZtkJNQRRc2YGCDUp3gsRXdG442VMDswbooaDyvS2Hx/";

export function getTimestampFromDate(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

// Public mint schedule
export const START_TIME = getTimestampFromDate(new Date(Date.now() + 1000 * 120));
export const END_TIME = getTimestampFromDate(new Date("2100-01-01T00:00:00Z"));
export const MINT_PRICE = ethers.utils.parseEther("10"); // 10 MATIC
export const MINT_AMOUNT = 200; // 0: Infinite, > 0: Public mint total amount
export const MAX_PER_USER = 0; // 0: Infinite, > 0: Max amount
export const ERC20_TOKEN = ethers.constants.AddressZero; // ERC20 Token address (Not set)
export const ERC20_AMOUNT = 0; // ERC20 Token amount

export const collections = [
  {
    name: "Seoul Stars Game Beta Pass",
    symbol: "SEOULSTARS",
    supply: 50,
    price: 0.01,
    uri_prefix: "https://ipfs.io/ipfs/QmYbSKvcXDZVyNW3RpmLo2fFamChAFXUoL87BgR4hEE6Aw/",
  },
  {
    name: "Aotuverse Game Beta Pass",
    symbol: "AOTUVERSE",
    supply: 200,
    price: 0.01,
    uri_prefix: "https://ipfs.io/ipfs/QmQhqxmhErRTDLPKGK1MZ8PDuWH18SBC3S3kTDGrFqGqLS/",
  },
  {
    name: "Prajna Gate Bronze Lootbox (Weapon)",
    symbol: "PRAJNA",
    supply: 100,
    price: 0.01,
    uri_prefix: "https://ipfs.io/ipfs/Qmedv5YzDdwFgjdsKKta4RkoYhm5gPuQVm2VfL1J5P1y9T/",
  },
  {
    name: "Prajna Gate Silver Lootbox (Weapon)",
    symbol: "PRAJNA",
    supply: 70,
    price: 0.01,
    uri_prefix: "https://ipfs.io/ipfs/QmTu3f9LPPmZZtrrLQBCCwfjU1J5y2aGG2pgjwSF5kXbpt/",
  },
  {
    name: "Prajna Gate Diamond Lootbox (Weapon)",
    symbol: "PRAJNA",
    supply: 30,
    price: 0.01,
    uri_prefix: "https://ipfs.io/ipfs/QmZKkpUhvFhH2pBEHZ2zUF1Uwei1xJdFwPgorWyXB8Vq93/",
  },
  {
    name: "Prajna Gate Game Beta Pass",
    symbol: "PRAJNA",
    supply: 200,
    price: 0.01,
    uri_prefix: "https://ipfs.io/ipfs/QmUAfQVAihxzfjQuntPuBJBPi52YG1obUPkwNFt6KJ6dUH/",
  },
  {
    name: "Voyage in Paradise Game Beta Pass",
    symbol: "VOYAGE",
    supply: 50,
    price: 0.01,
    uri_prefix: "https://ipfs.io/ipfs/QmQb43MLjz5z7Q2sgF433jgNc3PCCdduYPGB8t9XjK17CG/",
  },
  {
    name: "Star's End Metaverse Lootbox",
    symbol: "STARSEND",
    supply: 200,
    price: 0.01,
    uri_prefix: "https://ipfs.io/ipfs/QmRG47iBSfJ6Z9zYyPGCUiWhJrytdbQydVtoHSzHKTc3sj/",
  },
  {
    name: "Stars End Metaverse Game Beta Pass",
    symbol: "STARSEND",
    supply: 200,
    price: 0.01,
    uri_prefix: "https://ipfs.io/ipfs/QmQxmf6s97ChqBYoCWiKGSpt31gFYzkUBVm3ZdwBxzBU9p/",
  },
  {
    name: "Elteria Adventures Lootbox NFT (Elties)",
    symbol: "ELTERIA",
    supply: 100,
    price: 0.01,
    uri_prefix: "https://ipfs.io/ipfs/QmQfEKXiEi4wd7i46xCJjoDuAGzU7vrD4A3wGT2tH3V23z/",
  },
  {
    name: "Elteria Adventures Game Alpha Pass",
    symbol: "ELTERIA",
    supply: 200,
    price: 0.01,
    uri_prefix: "https://ipfs.io/ipfs/QmRMaGhdLbBdr5T9p5gL6XyooAQCnZfXf85AmBq72vqqFY/",
  },
  {
    name: "Neo Tokyo Conception Game Beta Pass",
    symbol: "NEOTOKYO",
    supply: 200,
    price: 0.01,
    uri_prefix: "https://ipfs.io/ipfs/QmXfrdXWDeoSWfyQQJ8bT9ptpa6RnofbCcGGpNHVCdv8UQ/",
  },
];
