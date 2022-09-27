// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx smart-contract run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { INITIAL_SUPPLY, TOKEN_NAME, TOKEN_SYMBOL } from "./params";
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

task("deploy:Catheon", "Deploy Catheon Token").setAction(async function (
  taskArguments: TaskArguments,
  hre
) {
  const WChicksFactory = await hre.ethers.getContractFactory("CatheonToken");

  // Deploy Contract
  const wChicksContract = await WChicksFactory.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    hre.ethers.utils.parseUnits(INITIAL_SUPPLY.toString(), 9)
  );
  await wChicksContract.deployed();

  console.log("Catheon Token deployed to:", wChicksContract.address);
});

task("verify:Catheon", "Verify Catheon Token")
  .addParam("address", "the deployed token contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    // Verify Contract
    await hre.run("verify:verify", {
      address: taskArguments.address,
      constructorArguments: [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        hre.ethers.utils.parseUnits(INITIAL_SUPPLY.toString(), 9),
      ],
    });

    console.log("Catheon Token was verified successfully!");
  });
