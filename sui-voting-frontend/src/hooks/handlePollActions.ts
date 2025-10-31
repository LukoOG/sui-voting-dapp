import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { createPollTx } from "@/lib/sui/suiTx";
import { createPollArgs } from "@/lib/types"

//interfaces
type createPollArgsT = createPollArgs & { address: string }

export const usePollActions = () => {
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const suiClient = useSuiClient();
    const queryClient = useQueryClient();
	
	const createPoll =  useMutation({
		mutationFn: async (args: createPollArgsT) => {
			const tx = createPollTx(args, args.address);
			
			const result = await signAndExecuteTransaction({ transaction: tx });
			await suiClient.waitForTransaction({ digest: result.digest });

			return result;
		},
		
		onSuccess: () => {},
		onError: () => {},
	});
	
	return { createPoll };
}