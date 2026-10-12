/**
 * Centralised Sui GraphQL client + typed query definitions.
 *
 * All GraphQL interaction goes through this file so there is exactly one
 * place to change the endpoint or add authentication headers.
 */

import { SuiGraphQLClient } from "@mysten/sui/graphql";
import suiEnv from "@/lib/sui/suiEnv";

// ---------------------------------------------------------------------------
// Endpoint — devnet by default; swap to testnet/mainnet via env var
// ---------------------------------------------------------------------------
export const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  "https://sui-devnet.mystenlabs.com/graphql";

// ---------------------------------------------------------------------------
// Singleton client instance
// ---------------------------------------------------------------------------
export const graphqlClient = new SuiGraphQLClient({ url: GRAPHQL_URL });

// ---------------------------------------------------------------------------
// Typed query strings
// ---------------------------------------------------------------------------

/**
 * Fetch a paginated list of Poll objects by their Move type.
 *
 * Variables: { first: Int, after: String }
 */
export const GET_POLLS_QUERY = `
  query GetPolls($first: Int, $after: String, $type: String!) {
    objects(
      first: $first
      after: $after
      filter: { type: $type }
    ) {
      nodes {
        address
        asMoveObject {
          contents {
            json
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
` as const;

/**
 * Fetch a single Poll object plus the first 50 dynamic fields on its votes table.
 *
 * Variables: { id: SuiAddress! }
 */
export const GET_POLL_BY_ID_QUERY = `
  query GetPollById($id: SuiAddress!) {
    object(address: $id) {
      address
      asMoveObject {
        contents {
          json
        }
      }
      dynamicFields(first: 50) {
        nodes {
          name {
            json
          }
          value {
            ... on MoveValue {
              json
            }
          }
        }
      }
    }
  }
` as const;

/**
 * Fetch Poll objects owned by or created by a given address.
 *
 * Variables: { owner: SuiAddress!, type: String! }
 */
export const GET_USER_POLLS_QUERY = `
  query GetUserPolls($owner: SuiAddress!, $type: String!) {
    address(address: $owner) {
      objects(filter: { type: $type }) {
        nodes {
          address
          asMoveObject {
            contents {
              json
            }
          }
        }
      }
    }
  }
` as const;

// ---------------------------------------------------------------------------
// Response shapes — mirror what the GraphQL schema returns in "json"
// ---------------------------------------------------------------------------

/**
 * Raw JSON shape returned by asMoveObject.contents.json for a Poll.
 *
 * The Sui GraphQL API unwraps Move structs into plain flat objects:
 *  - `id` is the object address string (not { id: string })
 *  - `options` items are flat (no { type, fields } envelope)
 *  - `poll_config` is flat (no { type, fields } envelope)
 *  - `voters.size` and `anon_voters.size` are string-encoded u64
 */
export interface RawPollJson {
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
  options: Array<{
    id?: string;
    name?: string;
    caption?: string;
    image_url?: string;
  }>;
  poll_config: {
    allow_anon_vote: boolean;
    allow_multiple_choice: boolean;
    allow_weighted: boolean;
  };
  /** size is a string-encoded u64 from the on-chain Table */
  voters: { id: string; size: string };
  anon_voters: { id: string; size: string };
  votes: { id: string; size: string };
}

/** A single page result from GET_POLLS_QUERY */
export interface PollsPageResult {
  objects: {
    nodes: Array<{
      address: string;
      asMoveObject: { contents: { json: RawPollJson } } | null;
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

/** Result from GET_POLL_BY_ID_QUERY */
export interface PollByIdResult {
  object: {
    address: string;
    asMoveObject: { contents: { json: RawPollJson } } | null;
    dynamicFields: {
      nodes: Array<{
        name: { json: unknown };
        value: { json: unknown } | null;
      }>;
    };
  } | null;
}

/** Result from GET_USER_POLLS_QUERY */
export interface UserPollsResult {
  address: {
    objects: {
      nodes: Array<{
        address: string;
        asMoveObject: { contents: { json: RawPollJson } } | null;
      }>;
    };
  } | null;
}

// ---------------------------------------------------------------------------
// Helper: build the fully-qualified Poll type string from env
// ---------------------------------------------------------------------------
export const POLL_TYPE = suiEnv.pollType;
