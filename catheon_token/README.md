# Catheon Token

## About

Ownable, Upgradeable ERC20 contract.

## Requirement

- Initial max supply (10 billion).
- Token decimals (9)
- While deploying, Deployer will own the tokens equals of Initial balance
- Fee
  - The fee will be applied upon token-transfer transactions between the addresses including the fee-applying-addresses ( 10% >= fee percentage > 0%, default: 5%).
  - The transfers from/to the treasury address will be not applied fee.
  - If any address was registered as a fee-applying-address by owner, While the transactions related with this address being executed, the transaction fee will be applied.
  - The fee should be transferred to treasury address.
- Mint/Burn tokens by only owner at any time.
- While burning tokens, the max supply of token will be not changed.
- Only owner can change `fee_percentage`, `feeApplies`, `treasury`, `max_supply`.

## Caution

- Should not override `Ownable` functions because ownership can not be renounced.
- If fee-applied-address list has the address of DEX pool, Lending pool, .., you can face some problems in something like as slippage. So before setting fee-applying-address, you should confirm some problems about fee on target address.
- Recommended that you should use the smart contract`s owner as a multi-sig wallet same as Gnosis safe.

## Upgradeability

- This token contract is the upgradeable contract. We can upgrade token contract for some reasons like as applying fee.
- We will provide upgraded version with updated audit document.

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
  export const TOKEN_NAME = "CATHEON";
  export const TOKEN_SYMBOL = "CATHEON";
  export const INITIAL_SUPPLY = 10_000_000_000;
  export const TREASURY = "0x1b32Ffce8928cb8d4612212417156308Ef4a7a1A";
  ```

- Deploy Token Contract on Polygon

  ```shell
  $ yarn deploy --network polygon
  ```

- Verify Token on Polygon scan

  ```shell
  $ yarn verify <IMPLEMENT_ADDRESS> --network polygon
  ```

- Mint token on Polygon

  ```shell
  $ yarn hardhat mint:Catheon --address <CATHON_TOKEN_ADDRESS> --to <MINT_TARGET_ADDRESS> --amount <MINT_AMOUNT_WITHOUT_DECIMALS> --network polygon
  ```
