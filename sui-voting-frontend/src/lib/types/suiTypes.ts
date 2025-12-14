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

interface SuiTable<T = unknown> {
  type: string;
  fields: T;
}

interface SuiId {
  id: string;
}

interface PollConfigFields {
  allow_anon_vote: boolean;
  allow_multiple_choice: boolean;
  allow_weighted: boolean;
}

interface PollConfig {
  type: string;
  fields: PollConfigFields;
}

interface PollOptionFields {
  id: string;
  name?: string;
  caption?: string;
  image_url?: string;
}

interface PollOption {
  type: string;
  fields: PollOptionFields;
}

export interface PollFields {
  anon_voters: SuiTable<{ size: number }>;
  close_time: string;
  creator: string;
  description: string;
  id: SuiId;
  is_active: boolean;
  options: PollOption[];
  poll_config: PollConfig;
  poll_id: string;
  start_time: string;
  thumbnail_url: string;
  title: string;
  voters: SuiTable<{ size: number }>;
  votes: SuiTable;
  category?: string;
}
