import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

task("mint:Catheon", "Mint Catheon Token")
  .addParam("address", "The deployed smart contract address")
  .addParam("to", "The deployed smart contract address")
  .addParam("amount", "Mint token amount (Without Decimals)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const catheonTokenContract = await hre.ethers.getContractAt(
      "CatheonToken",
      taskArguments.address
    );

    // Deploy Contract
    const tx = await catheonTokenContract.mint(
      taskArguments.to,
      hre.ethers.utils.parseUnits(taskArguments.amount, 9)
    );
    await tx.wait();

    console.log(
      `${taskArguments.amount} Catheon Token minted to ${taskArguments.to}. transaction:`,
      tx.hash
    );
  });
