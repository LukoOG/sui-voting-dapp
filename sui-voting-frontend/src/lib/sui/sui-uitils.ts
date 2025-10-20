import { Transaction } from "@mysten/sui/transactions";

interface PollOptions { title: string }

export const mintPoll = (_options: PollOptions): Transaction => {
	const tx = new Transaction()
	//implement
	return tx;
}