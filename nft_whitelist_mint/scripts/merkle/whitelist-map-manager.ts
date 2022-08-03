import { BigNumber, utils, constants } from "ethers";
import BalanceTree from "./balance-tree";

const { isAddress, getAddress } = utils;

// This is the blob that gets distributed and pinned to IPFS.
// It is completely sufficient for recreating the entire merkle tree.
// Anyone can verify that all air drops are included in the tree,
// and the tree has no additional distributions.
export interface MerkleDistributorInfo {
  merkleRoot: string;
  tokenTotal: string;
  list: {
    [account: string]: {
      index: number;
      amount: string;
      proof: string[];
    };
  };
}

type OldFormat = { [account: string]: number };
type NewFormat = { address: string; earnings: string };

export default class WhitelistMapManager {
  private readonly whitelist: OldFormat;
  public merkleInfo: MerkleDistributorInfo;

  constructor(_whitelist: OldFormat) {
    this.whitelist = _whitelist;
    this.merkleInfo = this.parseBalanceMap();
  }

  public addNodes(_nodes: OldFormat) {
    Object.keys(_nodes).forEach((account) => {
      if (account === constants.AddressZero) {
        throw new Error("Invalid node: " + account);
      }
      if (this.whitelist[account] !== undefined) {
        this.whitelist[account] = this.whitelist[account] + _nodes[account];
      } else {
        this.whitelist[account] = _nodes[account];
      }
    });
    this.merkleInfo = this.parseBalanceMap();
  }

  public removeNodes(_accounts: string[]) {
    _accounts.forEach((account) => {
      if (this.whitelist[account] !== undefined) {
        delete this.whitelist[account];
      }
    });
    this.merkleInfo = this.parseBalanceMap();
  }

  public parseBalanceMap(): MerkleDistributorInfo {
    // if balances are in an old format, process them
    const balancesInNewFormat: NewFormat[] = Object.keys(this.whitelist).map(
      (account): NewFormat => ({
        address: account,
        earnings: `0x${this.whitelist[account].toString(16)}`,
      })
    );

    const dataByAddress = balancesInNewFormat.reduce<{
      [address: string]: {
        amount: BigNumber;
      };
    }>((memo, { address: account, earnings }) => {
      if (!isAddress(account)) {
        throw new Error(`Found invalid address: ${account}`);
      }
      const parsed = getAddress(account);
      if (memo[parsed]) throw new Error(`Duplicate address: ${parsed}`);
      const parsedNum = BigNumber.from(earnings);

      memo[parsed] = {
        amount: parsedNum,
      };
      return memo;
    }, {});

    const sortedAddresses = Object.keys(dataByAddress).sort();

    // construct a tree
    const tree = new BalanceTree(
      sortedAddresses.map((address) => ({
        account: address,
        amount: dataByAddress[address].amount,
      }))
    );

    // generate list
    const list = sortedAddresses.reduce<{
      [address: string]: {
        amount: string;
        index: number;
        proof: string[];
      };
    }>((memo, address, index) => {
      const { amount } = dataByAddress[address];
      memo[address] = {
        index,
        amount: amount.toHexString(),
        proof: tree.getProof(index, address, amount),
      };
      return memo;
    }, {});

    const tokenTotal: BigNumber = sortedAddresses.reduce<BigNumber>(
      (memo, key) => memo.add(dataByAddress[key].amount),
      BigNumber.from(0)
    );

    return {
      merkleRoot: tree.getHexRoot(),
      tokenTotal: tokenTotal.toHexString(),
      list,
    };
  }
}
