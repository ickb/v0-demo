"use strict";

import fs from "fs";
import {initializeConfig} from "@ckb-lumos/config-manager";
import {addressToScript, TransactionSkeleton} from "@ckb-lumos/helpers";
import {Indexer} from "@ckb-lumos/ckb-indexer";
import {addDefaultCellDeps, addDefaultWitnessPlaceholders, getLiveCell, sendTransaction, signTransaction, waitForTransactionConfirmation} from "../lib/index.js";
import {hexToInt, intToHex} from "../lib/util.js";
import {describeTransaction} from "./lab.js";
const CONFIG = JSON.parse(fs.readFileSync("../config.json"));

const NODE_URL = "http://127.0.0.1:8114/";
const INDEXER_URL = "http://127.0.0.1:8114/";
const PRIVATE_KEY = "0xd00c06bfd800d27397002dca6fb0993d5ba6399b4238b2f29ee9deb97593d2bc";
const ADDRESS = "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqwgx292hnvmn68xf779vmzrshpmm6epn4c0cgwga";
const PREVIOUS_OUTPUT =
{
	txHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
	index: "0x0"
};
const TX_FEE = 100_000n;

async function main()
{
	// Initialize the Lumos configuration using ./config.json.
	initializeConfig(CONFIG);

	// Initialize an Indexer instance.
	const indexer = new Indexer(INDEXER_URL, NODE_URL);

	// Create a transaction skeleton.
	let transaction = TransactionSkeleton();

	// Add the cell dep for the lock script.
	transaction = addDefaultCellDeps(transaction);

	// Add the input cell to the transaction.
	const input = await getLiveCell(NODE_URL, PREVIOUS_OUTPUT);
	transaction = transaction.update("inputs", (i)=>i.push(input));

	// Add an output cell.
	const outputCapacity = intToHex(hexToInt(input.cellOutput.capacity) - TX_FEE);
	const output = {cellOutput: {capacity: outputCapacity, lock: addressToScript(ADDRESS), type: null}, data: "0x"};
	transaction = transaction.update("outputs", (i)=>i.push(output));

	// Add in the witness placeholders.
	transaction = addDefaultWitnessPlaceholders(transaction);

	// Print the details of the transaction to the console.
	describeTransaction(transaction.toJS());

	// Sign the transaction.
	const signedTx = signTransaction(transaction, PRIVATE_KEY);

	// Send the transaction to the RPC node.
	const txid = await sendTransaction(NODE_URL, signedTx);
	console.log(`Transaction Sent: ${txid}\n`);

	// Wait for the transaction to confirm.
	await waitForTransactionConfirmation(NODE_URL, txid);
	console.log("\n");

	console.log("Example completed successfully!");
}
main();
