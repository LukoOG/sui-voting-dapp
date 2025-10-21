//Sui helper functions
import { Transaction } from "@mysten/sui/transactions";
import suiEnv from "@/lib/sui/suiEnv";

interface PollOptions { title: string }

export const createPollTx = ({ title }: PollOptions): Transaction => {
	const tx = new Transaction()
	
	tx.moveCall({
		
	});
	
	tx.setGasBudget(1000000);
	return tx.build();
}