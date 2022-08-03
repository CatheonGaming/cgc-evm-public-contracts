# Whitelist Mint NFT contract

## About

The NFT contract having public/whitelist mint functionalities

## Implement

- CGCWhitelistERC721A

  - The smart contract in order to mint nfts by whitelist/public mint schedules.
  - This contract was built by using `ERC721A`
  - The smart contract has the following features
    - whitelist/public mint
    - mint by owner without fund
    - pause/unpause the minting by owner
    - set several phases of minting schedules

## Usage

### Configuration

- create `.env` file by using `.env.sample` and set keys
  ```
  INFURA_API_KEY=<INFURA_API_KEY>
  PRIVATE_KEY=<YOUR_EOA_PRIVATE_KEY>
  ETHERSCAN_API_KEY=<ETHERSCAN_API_KEY>
  REPORT_GAS=true
  ```

### Install packages

```
$ yarn install
```

### Build smart contracts

```
$ yarn compile
```

### Test smart contracts (Unit tests)

```
$ yarn test
```

### Deploy smart contract

- Set params for deploying in `tasks/params.ts`

```
export const NFT_NAME = "3000 KINGS NFT";          // NFT Collection Name
export const NFT_SYMBOL = "3KN";            // NFT Collection Symbol
export const MAX_SUPPLY = 3000;                 // MAX_SUPPLY of NFT COLLECTION
export const URI_PREFIX = "https://ipfs.io/ipfs/QmZegrFAf9KXK6D4ZjMkq6uTmNuiN1ChJg6ecvgBKV8vWK/";   // BASE_URI
```

- Run command

```
$ yarn deploy <TARGET_NETWORK>
```

- `<TARGET_NETWORK>`  
  You can set the target network name in the following.
  ```
  ethermain, // Ethereum
  bscmain, // BSC
  polygon, // Polygon
  avaxmain, // Avalanche
  ```

### Verify smart contract

```
$ yarn verify:CGCWhitelistERC721A <TARGET_NETWORK> --address <NFT_CONTRACT_ADDRESS>
```

### Set new whitelist mint schedule

#### 1. Generate merkle-whitelist from whitelist

- Insert whitelist data in `data/whitelist.json` file with the following JSON format.

```
<ACCOUNT_ADDRESSS1> : <MINT_AMOUNT1>,
<ACCOUNT_ADDRESSS2> : <MINT_AMOUNT2>,
...
```

- Run command for generating merkle-whitelist

```
$ yarn generate-merkle-tree
```

- Result

```
MerkleRoot:  0xeba5f4767e6818b2a67678d9e55ecc2a8f2127e88f6c83f604a52b141d7f86a9     // Merkle Root Hash
TokenTotal: 0xe1 (225)                                                              // Total amount
MerkleWhitelist Items:  100                                                         // The number of record in list
```

By this command, you can get merkle-whitelist to `data/merkle_info.json` file.

#### 2. Set merkle-whitelist mint schedule to contract

- Set params for merkle-whitelist mint in `tasks/params.ts` file

```
// Whitelist mint schedule 1
export const MERKLE_ROOT1 = "0xeba5f4767e6818b2a67678d9e55ecc2a8f2127e88f6c83f604a52b141d7f86a9";   // Merkle root hash
export const START_TIME1 = getTimestampFromDate(new Date("2022-07-22T16:30:00Z"));                  // Start time
export const END_TIME1 = getTimestampFromDate(new Date("2022-07-22T17:00:00Z"));                    // End time
export const MINT_PRICE1 = ethers.utils.parseEther("0.05");                                         // whitelist mint price 0.05 ETH
export const MERKLE_TOTAL = 40;                                                                     // Merkle token total amount
```

- Run command for setting merkle-whitelist mint schedule on contract

```
$ yarn hardhat set:WhitelistSale --network <TARGET_NETWORK> --address <NFT_CONTRACT_ADDRESS>
```

You can set another whitelist schedule with new params like as above.

### Set new public-mint schedule to contract

- Set params for public-mint in `tasks/params.ts` file

```
// Public mint schedule 1
export const START_TIME2 = getTimestampFromDate(new Date("2022-07-22T17:30:00Z"));                  // Start time
export const END_TIME2 = getTimestampFromDate(new Date("2022-07-22T19:00:00Z"));                    // End time
export const MINT_PRICE2 = ethers.utils.parseEther("0.1");                                          // whitelist mint price 0.05 ETH
export const MINT_AMOUNT2 = 40;                                                                     // Mint amount
export const MAX_PER_USER = 2;                                                                      // Max mint amount per user, 0: infinite mint, > 0: check max
```

- Run command for setting public-mint schedule on contract

```
$ yarn hardhat set:PublicSale --network <TARGET_NETWORK> --address <NFT_CONTRACT_ADDRESS>
```

You can set another public schedule with new params like as above.
