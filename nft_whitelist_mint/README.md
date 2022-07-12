# Catheon Gaming Center Whitelist Mint NFT contract

## About

The NFT contract having public/whitelist mint functionalities

## Implement
- WhitelistMintNFT

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

```
$ yarn deploy <TARGET_NETWORK> 
```

### Upgrade smart contract

```
$ yarn upgrade:WhitelistMintNFT <TARGET_NETWORK> --address <DEPLOYED_OLD_ADDRESS> 
```

- <TARGET_NETWORK>  
  You can set the target network name in the following.
    ```
    ethermain, // Ethereum
    bscmain, // BSC
    polygon, // Polygon
    avaxmain, // Avalanche
    ```