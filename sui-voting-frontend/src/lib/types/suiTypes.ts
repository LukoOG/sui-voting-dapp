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