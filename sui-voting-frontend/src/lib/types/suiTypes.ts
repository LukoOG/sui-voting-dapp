export type Option = {
	name: string,
	image: string | null | undefined,
	caption: string	| null | undefined,
}

export interface createPollArgs { 
	title: string,
	description: string | null,
	thumbnail: string,
	duration: number,
	options: Option[],
	config: boolean[],
};

export interface votePollArgs {
	poll_id: string,
	option_index: number,
	owner: string,
	is_anonymous: boolean,
	weight: number,
};