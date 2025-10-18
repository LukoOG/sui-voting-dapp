module poll::poll;

use std::string::{String};
use sui::table;
use sui::package::{Self, Publisher};

//package One time witness
public struct POLL has drop ()
#[allow(unused_field)]
public struct PollRegistery has key{
	id: UID,
	owner: address,
	polls: table::Table<u64, Poll>,	
}
#[allow(unused_field)]
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
#[allow(unused_field)]
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
	package::claim_and_keep(otw, ctx)
}

public fun create_CreatePollRequest(): CreatePollRequest{
	CreatePollRequest {}
}

public fun create_poll(_createRequest: CreatePollRequest, _ctx: &mut TxContext) {
	abort 0
}

public fun vote_on_poll(_ctx: &mut TxContext){
	abort 0
}

#[test_only]
use sui::test_scenario as ts;
#[test_only]
use std::debug::print;

#[test_only]
const Admin: address = @0xBAB434;

//test functions
#[test_only]
fun init_for_testing(ctx: &mut TxContext){
	init(POLL(), ctx)
}

#[test]
fun test_init(){
	let mut scenario = ts::begin(Admin);
	{
		init_for_testing(scenario.ctx());
	};
	scenario.next_tx(Admin);
	print(&scenario);
	
	let p = ts::ta
	
	assert!(scenario.has_most_recent_for_sender<Publisher>(), 1);
	
	scenario.end();
}