import { useMutation } from "@tanstack/react-query";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { createPollTx, votePollTx } from "@/lib/sui/suiTx";
import { createPollArgs, votePollArgs } from "@/lib/types";

//interfaces & types
type createPollArgsT = createPollArgs & { address: string };
type votePollArgsT = votePollArgs & { address: string };

export const usePollActions = () => {
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const suiClient = useSuiClient();
	
	const createPoll =  useMutation({
		mutationFn: async (args: createPollArgsT) => {
			console.log(args)
			const tx = createPollTx(args, args.address);
			
			const result = await signAndExecuteTransaction({ transaction: tx });
			await suiClient.waitForTransaction({ digest: result.digest });

			return result;
		},
		
		onSuccess: () => {},
		onError: () => {},
	});
	
	const walletVote = useMutation({
		mutationFn: async (args: votePollArgsT) => {
			const tx = votePollTx(args, args.address);
			
			const result = await signAndExecuteTransaction({ transaction: tx });
			await suiClient.waitForTransaction({ digest: result.digest });

			return result;
		},
		
		onSuccess: () => {},
		onError: () => {},
	})
	
	return { createPoll, walletVote };
}