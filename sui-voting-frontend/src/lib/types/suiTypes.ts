export type Option = {
	name: string,
	image: string | null,
	caption: string	| null,
}

export interface createPollArgs { 
	title: string,
	description: string | null,
	thumbnail: string,
	duration: number,
	options: Option[],
	config: boolean[],
};