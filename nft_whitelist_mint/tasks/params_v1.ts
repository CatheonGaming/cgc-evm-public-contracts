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
    price: 5,
    uri_prefix: "https://ipfs.io/ipfs/QmQy71Ks89S3brLXczuMN1a2PkNuUs1GqimBunSv5nnKbx/",
  },
  {
    name: "Aotuverse Game Beta Pass",
    symbol: "AOTUVERSE",
    supply: 200,
    price: 5,
    uri_prefix: "https://ipfs.io/ipfs/QmWUef3d3bf81Txw5S5KciC8MAnGXAHpQRvsYDn3W65mtq/",
  },
  {
    name: "Prajna Gate Bronze Lootbox (Weapon)",
    symbol: "PRAJNA",
    supply: 100,
    price: 5,
    uri_prefix: "https://ipfs.io/ipfs/QmWyWQDJamU4QjogU94XHW5PEMZ3EjsSQ1fW2KMHdFDzik/",
  },
  {
    name: "Prajna Gate Silver Lootbox (Weapon)",
    symbol: "PRAJNA",
    supply: 70,
    price: 7,
    uri_prefix: "https://ipfs.io/ipfs/QmdwkgH5dkX23ebYivf3cDpo2tonuNfejTCcTW86YSjaL6/",
  },
  {
    name: "Prajna Gate Diamond Lootbox (Weapon)",
    symbol: "PRAJNA",
    supply: 30,
    price: 10,
    uri_prefix: "https://ipfs.io/ipfs/QmVrnKwzFdNrRcNp3P7zytz1f4VcQy5FTsuZo3qFSpo8ZL/",
  },
  {
    name: "Prajna Gate Game Beta Pass",
    symbol: "PRAJNA",
    supply: 200,
    price: 5,
    uri_prefix: "https://ipfs.io/ipfs/QmTHnfCT2VLRehH8bfQW4EHCLvFCPYM2V96XXTCKJd8Xr1/",
  },
  {
    name: "Voyage in Paradise Game Beta Pass",
    symbol: "VOYAGEIP",
    supply: 50,
    price: 5,
    uri_prefix: "https://ipfs.io/ipfs/QmXCUS3AZXmbKT5fH9eCjKoGLyyKAg4yCSdauzjPmUWQtG/",
  },
  {
    name: "Star's End Metaverse Lootbox",
    symbol: "STARSEND",
    supply: 200,
    price: 5,
    uri_prefix: "https://ipfs.io/ipfs/Qme3x4AqVu4GZBN3GsodxZXSH2d7MyVJXpJgKtCG6naYYf/",
  },
  {
    name: "Stars End Game Beta Pass",
    symbol: "STARSEND",
    supply: 200,
    price: 5,
    uri_prefix: "https://ipfs.io/ipfs/QmdnUt6pGuiFGto7DPaZwKkGF1u3uRhyL7qBJKXaeY8P45/",
  },
  {
    name: "Elteria Adventures Lootbox NFT (Elties)",
    symbol: "ELTERIA",
    supply: 100,
    price: 100,
    uri_prefix: "https://ipfs.io/ipfs/QmWj65rhHfM3NiWaQEUs6E5z6dd5UZ3VLQVUHmzvXsahse/",
  },
  {
    name: "Elteria Adventures Game Alpha Pass",
    symbol: "ELTERIA",
    supply: 200,
    price: 5,
    uri_prefix: "https://ipfs.io/ipfs/QmXxsxK5n9FkYeFQnPArB7NjtxswRckMjjf2wc3rH7R7jC/",
  },
  {
    name: "Tokyo Conception Game Beta Pass",
    symbol: "TOKYO",
    supply: 200,
    price: 5,
    uri_prefix: "https://ipfs.io/ipfs/QmPJjTkW18NnGXRfkWH7KFCipAZqgKdxZoSvpjP5JLnXmU/",
  },
];
