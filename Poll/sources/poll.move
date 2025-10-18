module poll::poll;

use std::string::{String};
use sui::table;
use sui::package::{Self, Publisher};

//package One time witness
public struct POLL has drop ()

public struct PollRegistery has key{
	id: UID,
	owner: address,
	polls: table::Table<u64, Poll>,	
}

public struct Poll has key, store{
	id: UID,
	name: String,
	creator: address,
	is_active: u64,
	deadline: u64,
	options: vector<String>,
	votes: table::Table<u64, u64>,
	voters: table::Table<address, u64>,
}

public struct VoteReceipt has key {
	id: UID,
	poll_id: ID,
	voter: address,
	option_index: u64,
}

//hot potatoes
public struct CreatePollRequest {
	//fields
}

///functions
fun init(otw: POLL, ctx: &mut TxContext){
	let publisher: Publisher = package::claim(otw, ctx);
	
	transfer::public_transfer(publisher, ctx.sender())
}

public fun create_poll(name: String, ctx: &mut TxContext) {
	abort 0;
}

public fun vote_on_poll(ctx: &mut TxContext){
	abort 0;
}

#[test_only]
use sui::test_scenario as ts;

#[test_only]
const Admin: address = @0x3;

#[test]
fun test_init(){
	let mut scenario = ts::begin(Admin);
	let poll: POLL = POLL();
	
	{
		init(poll, scenario.ctx())
	};
	
	scenario.end();
}