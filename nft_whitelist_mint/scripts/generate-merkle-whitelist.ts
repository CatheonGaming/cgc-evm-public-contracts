import { program } from "commander";
import fs from "fs";
import BalanceMapManager from "./merkle/whitelist-map-manager";

program
  .version("0.0.1")
  .requiredOption(
    "-i, --input <PATH>",
    "input JSON file location containing a map of account addresses to string balances"
  )
  .requiredOption("-o, --output <PATH>", "output JSON file location containing the merkle tree data");

program.parse(process.argv);

try {
  const options = program.opts();
  const json = JSON.parse(fs.readFileSync(options.input, { encoding: "utf8" }));

  if (typeof json !== "object") throw new Error("Invalid JSON");

  const balanceMapManager = new BalanceMapManager(json);
  const merkleInfo = balanceMapManager.merkleInfo;

  console.log("MerkleRoot: ", merkleInfo.merkleRoot);
  console.log(`TokenTotal: ${merkleInfo.tokenTotal} (${Number(merkleInfo.tokenTotal)})`);
  console.log("MerkleWhitelist Items: ", Object.keys(merkleInfo.list).length);

  fs.writeFileSync(options.output, JSON.stringify(merkleInfo), {
    encoding: "utf8",
  });
} catch (e: any) {
  console.error(`Generate merkle whitelist failed: ${e.message}`);
}
