import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { createPollTx } from "@/lib/sui/sui-utils";

//interfaces

export default const usePollActions = () => {
    const account = useCurrentAccount()
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const suiClient = useSuiClient();
    const queryClient = useQueryClient();
	
	const createPoll = () => useMutation({
		mutationFn: async ({}) => {
			const tx = createPollTx();
			
			const result = await signAndExecuteTransaction({ transaction: tx });
			await suiClient.waitForTransaction({ digest: result.digest });

			return result;
		};
		
		onSuccess: () => {};
		onError: () => {};
	});
	
	return { createPoll };
}