//Sui helper functions
import { Transaction } from "@mysten/sui/transactions";
import suiEnv from "@/lib/sui/suiEnv";
import { createPollArgs, votePollArgs } from "@/lib/types"

export const createPollTx =  ({ title, description, thumbnail, duration, options, config }: createPollArgs, address: string) => {
	const tx = new Transaction()
	
	const request = tx.moveCall({
		target: `${suiEnv.packageId}::poll::createCreatePollRequest`,
		arguments: [
			tx.object(suiEnv.versionObject),
			tx.pure.string(title),
			tx.pure.option('string', description),
			tx.pure.string(thumbnail),
			tx.pure.u64(duration),
			tx.pure('vector<string>', options.map((opt) => opt.name )),
			tx.pure('vector<option<string>>', options.map((opt) => opt.image ?? null)),
			tx.pure('vector<option<string>>', options.map((opt) => opt.caption ?? null)),
			tx.pure.vector('bool', config ? config : [true, true, true]),
		],
		typeArguments: [],
	});
	
;
	
	
	const poll = tx.moveCall({
		target: `${suiEnv.packageId}::poll::create_poll`,
		arguments: [			
			tx.object(suiEnv.registeryObject),
			request,
			tx.object("0x6"),
		],
		typeArguments: [],
	});
	
	tx.transferObjects([poll], address)
	return tx
}

export const votePollTx = ({ poll_id, option_index, owner, is_anonymous, weight } :votePollArgs) => {
	const tx = new Transaction();
	const ticket = tx.moveCall({
		target: `${suiEnv.packageId}::poll::createVoteTicket`,
		arguments: [
			tx.object(suiEnv.versionObject),
			tx.object(poll_id),
			tx.pure.u64(option_index),
			tx.pure.address(owner),
			tx.pure.bool(is_anonymous),
			tx.pure.option('vector<u8>', [1, 54, 66]),
			tx.pure.u8(weight),
		],
		typeArguments: [],
	});
	
	tx.moveCall({
		target: `${suiEnv.packageId}::poll::vote_on_poll`,
		arguments: [
			tx.object(poll_id),
			ticket,
			tx.object("0x6"),
		],
		typeArguments: [],
	});
	
	// tx.transferObjects([voteReceipt], address); 
	return tx
}