module poll::poll;

use std::string::{String};
use sui::table;
use sui::package::{Self, Publisher};


const EInvalidNoOfOptions: u64 = 12;
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
	title: String,
	description: option<String>,
	creator: address,
	is_active: bool,
	start_time: u64,
	close_time: u64,
	options: vector<PollOption>,
	votes: table::Table<u64, u64>, //poll option to number of votes
	voters: table::Table<address, u64>,
}

#[allow(unused_field)]
public struct PollOption has store {
    id: u64,
    name: String,
    image_url: Option<String>,
    caption: Option<String>,
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
	title: String,
	description: Option<String>,
	duration: u64,
	options: vector<PollOption>,
}

///functions
fun init(otw: POLL, ctx: &mut TxContext){
	package::claim_and_keep(otw, ctx)
}

fun createPollOption(id: &u64, name:String, image_url:option<String>, caption:option): PollOption{
	ass
	PollOption { *id, name }
}

public fun create_CreatePollRequest(
	title: String, 
	desc: String, 
	duration: u64,
	option_names: vector<String>,
    option_images: vector<Option<String>>,
    option_captions: vector<Option<String>>,
	ctx: &mut TxContext
): CreatePollRequest{
	assert!(option_names.length() > 2, EInvalidNoOfOptions);
	
	let mut poll_options: vector<PollOption> = vector::empty<PollOption>();
	let len: u64 = option_names.length();
	let mut i = 0;
	while(i<len){
		let option = createPollOption(&i)
	};
	
	CreatePollRequest {  }
}

public fun create_poll(registery: &mut PollRegistery, createRequest: CreatePollRequest, ctx: &mut TxContext) {
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
	
	assert!(scenario.has_most_recent_for_sender<Publisher>(), 1);
	
	scenario.end();
}