import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { createPollTx } from "@/lib/sui/suiUtils";
import { createPollArgs } from "@/lib/types"

//interfaces
type createPollArgs = createPollArgs & { address: string }

export const usePollActions = () => {
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const suiClient = useSuiClient();
    const queryClient = useQueryClient();
	
	const createPoll =  useMutation({
		mutationFn: async (args: createPollArgs) => {
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