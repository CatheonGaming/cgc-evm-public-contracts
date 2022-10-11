# Catheon Token

## About
Ownable, Upgradeable ERC20 contract.

## Requirement
- Initial max supply (10 billion).
- Apply fee in token-transfer transactions between users excluding service addresses ( 90% >= fee percentage > 0%, default: 5%).
- The fee should be transferred to treasury address.
- Mint/Burn tokens by only owner at any time.
- Only owner can change `fee_percentage`, `services`, `treasury`, `max_supply`.
- Will not override `Ownable` functions because ownership can not be renounced.
- If any address was registered as a service by owner, While the transactions related with this address being executed, the transaction fee will be not applied.
  (For CGC, we are going to set the services with the CGC treasury addresses such as Catheon-Bridge pool, GameToken-Exchange pool, CGC-Marketplace contract...)

## Implement
> Language: Solidity  
> Framework: Hardhat  
> Networks: Polygon, Ethereum, BSC  
> Unit Test: Hardhat, Chai

## Installation
```shell
$ yarn install
```

## Usage

#### 1. Environment variables
- Create a `.env` file and set environment variables (refer `.env.sample` file)
```
INFURA_API_KEY=[INFURA_API_KEY]
ADMIN_KEY=[DEPLOYER_PRIVATE_KEY]
SCAN_API_KEY=[SCAN_API_KEY]
REPORT_GAS=<true_or_false>
```

#### 2. Build token contract
Build Smart Contract
```shell
$ yarn compile
```

#### 3. Test
Unit Test of Smart Contract
```shell
$ yarn test
```

#### 4. Deploy Token Contract on Polygon

- Configuration  
  Set token's name and symbol, initial_supply, treasury in `scripts/params.ts` file

```shell
export const TOKEN_NAME = "CATHEON TOKEN";
export const TOKEN_SYMBOL = "CATHEON";
export const INITIAL_SUPPLY = 1000_000_000;
export const TREASURY = "0x76e7BC85008156cFc477d5cc0a6c69616BaD269e";
```

- Deploy Token Contract on Polygon

```shell
$ yarn deploy --network polygon
```
