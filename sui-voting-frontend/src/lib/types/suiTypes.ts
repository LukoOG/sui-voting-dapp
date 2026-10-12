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

/**
 * Flat table reference as returned by the Sui GraphQL JSON representation.
 * The `size` field is a string-encoded u64 on-chain.
 */
interface SuiTableRef {
  id: string;
  size: string;
}

/**
 * Poll configuration as returned by asMoveObject.contents.json.
 * GraphQL unwraps Move structs into plain flat objects — no { type, fields }
 * envelope.
 */
interface PollConfig {
  allow_anon_vote: boolean;
  allow_multiple_choice: boolean;
  allow_weighted: boolean;
}

/**
 * A single poll option as returned by asMoveObject.contents.json.
 */
interface PollOption {
  id?: string;
  name?: string;
  caption?: string;
  image_url?: string;
}

/**
 * Full Poll object shape as returned by asMoveObject.contents.json via the
 * Sui GraphQL API.
 *
 * Key differences from the old JSON-RPC showContent shape:
 *  - `id` is a plain address string, not `{ id: string }`
 *  - `options` items are flat objects, not `{ type, fields: { … } }`
 *  - `poll_config` is a flat object, not `{ type, fields: { … } }`
 *  - `voters.size` / `anon_voters.size` are string-encoded u64 values
 */
export interface PollFields {
  id: string;
  poll_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  creator: string;
  is_active: boolean;
  start_time: string;
  close_time: string;
  category?: string;
  options: PollOption[];
  poll_config: PollConfig;
  voters: SuiTableRef;
  anon_voters: SuiTableRef;
  votes: SuiTableRef;
}
