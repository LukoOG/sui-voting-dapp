#[allow(unused_field)]
module poll::anon;

//imports
//use std::string::{Self, String};

//structs
public struct Anon has store, drop {
	id: ID,
}

//can only be created after specific conditions are met - regulated by the frontend
public struct AnonVoteTicket {
	id: ID
}

///functions
public fun createAnonVoteTicket(_ctx: TxContext){
	abort 0
}