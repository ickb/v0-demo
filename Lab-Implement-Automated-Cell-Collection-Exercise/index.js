"use strict";

import fs from "fs";
import {initializeConfig} from "@ckb-lumos/config-manager";
import {addressToScript, TransactionSkeleton} from "@ckb-lumos/helpers";
import {Indexer} from "@ckb-lumos/ckb-indexer"; 
import {addDefaultCellDeps, addDefaultWitnessPlaceholders, collectCapacity, sendTransaction, signTransaction, waitForTransactionConfirmation} from "../lib/index.js";
import {ckbytesToShannons, hexToInt, intToHex} from "../lib/util.js";
import {describeTransaction, initializeLab, validateLab} from "./lab.js";
const CONFIG = JSON.parse(fs.readFileSync("../config.json"));

// CKB Node and CKB Indexer Node JSON RPC URLs.
const NODE_URL = "http://127.0.0.1:8114/";
const INDEXER_URL = "http://127.0.0.1:8114/";

// This is the private key and address which will be setup with a specific Cell configuration for this lab.
const PRIVATE_KEY = "0x67842f5e4fa0edb34c9b4adbe8c3c1f3c737941f7c875d18bc6ec2f80554111d";
const ADDRESS_1 = "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqvc32wruaxqnk4hdj8yr4yp5u056dkhwtc94sy8q";

// This is the address we will be sending to.
const ADDRESS_2 = "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqwgx292hnvmn68xf779vmzrshpmm6epn4c0cgwga";

// This is the TX fee amount that will be paid in Shannons.
const TX_FEE = ???;

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

	// Initialize our lab.
	await initializeLab(NODE_URL, indexer);

	// Create a cell with 100 CKBytes.
	const outputCapacity1 = ???;
	const output1 = {cellOutput: {capacity: outputCapacity1, lock: addressToScript(ADDRESS_2), type: null}, data: "0x"};
	transaction = transaction.update("outputs", (i)=>i.push(output1));

	// Add capacity to the transaction.
	const capacityRequired = ???; // output1 + minimum for a change cell + tx fee
	const {inputCells} = ???;
	transaction = transaction.update("inputs", (i)=>i.concat(inputCells));

	// Get the capacity sums of the inputs and outputs.
	const inputCapacity = transaction.inputs.toArray().reduce((a, c)=>a+hexToInt(c.cellOutput.capacity), 0n);
	const outputCapacity = transaction.outputs.toArray().reduce((a, c)=>a+hexToInt(c.cellOutput.capacity), 0n);

	// Create a change Cell for the remaining CKBytes.
	const outputCapacity2 = ???;
	const output2 = ???;
	transaction = transaction.update("outputs", (i)=>i.push(output2));

	// Add in the witness placeholders.
	transaction = addDefaultWitnessPlaceholders(transaction);

	// Print the details of the transaction to the console.
	describeTransaction(transaction.toJS());

	// Validate the transaction against the lab requirements.
	await validateLab(transaction);

	// Sign the transaction.
	const signedTx = signTransaction(transaction, PRIVATE_KEY);

	// Send the transaction to the RPC node.
	const txid = await sendTransaction(NODE_URL, signedTx);
	console.log(`Transaction Sent: ${txid}\n`);

	// Wait for the transaction to confirm.
	await waitForTransactionConfirmation(NODE_URL, txid);
	console.log("\n");

	console.log("Lab exercise completed successfully!");
}
main();
