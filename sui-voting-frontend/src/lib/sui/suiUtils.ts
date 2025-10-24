//Sui helper functions
import { Transaction } from "@mysten/sui/transactions";
import suiEnv from "@/lib/sui/suiEnv";
import { createPollArgs } from "@/lib/types"

export const createPollTx =  ({ title, description, thumbnail, duration, options }: createPollArgs, address: string) => {
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
		],
		typeArguments: [],
	});
	console.log(suiEnv.packageId)
	
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