module poll::poll;

use std::string::{String};
use sui::table;
use sui::package::{Self, Publisher};
use sui::clock::Clock;

const EInvalidNoOfOptions: u64 = 12;
const EUnequalLength :u64 = 13;

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
	description: option::Option<String>,
	creator: address,
	is_active: bool,
	start_time: u64,
	close_time: u64,
	options: vector<PollOption>,
	votes: table::Table<u64, u64>, //poll option to number of votes
	voters: table::Table<address, u64>,
}

#[allow(unused_field)]
public struct PollOption has store, drop {
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
public struct CreatePollRequest has drop {
	title: String,
	description: Option<String>,
	duration: u64,
	options: vector<PollOption>,
}

///functions
fun init(otw: POLL, ctx: &mut TxContext){
	package::claim_and_keep(otw, ctx)
}

//helpers

fun createPollOption(id: &u64, name:String, image_url:option::Option<String>, caption:option::Option<String>): PollOption{
	let id = *id;
	PollOption { id, name, image_url, caption }
}

fun set_duration(d: u64, clock: &Clock): u64{
	clock.timestamp_ms() + d
}

//tx functions

public fun createCreatePollRequest(
	title: String, 
	desc: option::Option<String>, 
	duration: u64,
	option_names: vector<String>,
    option_images: vector<Option<String>>,
    option_captions: vector<Option<String>>,
	clock: &Clock,
	ctx: &mut TxContext
): CreatePollRequest{
	assert!(option_names.length() > 2, EInvalidNoOfOptions);
	if(!option_images.is_empty()){ assert!(option_images.length() == option_names.length(), EUnequalLength); };
	
	let mut poll_options: vector<PollOption> = vector::empty<PollOption>();
	let len: u64 = option_names.length();
	let mut i: u64 = 0;
	while (i < len) {
		let image_url = if(option_images.length() < i) { *option_images.borrow(i) } else { option::none<String>() };
		let caption = if(option_captions.length() < i) { *option_captions.borrow(i)  } else { option::none<String>() };
		let option_name = *option_names.borrow(i);
		let option = createPollOption(&i, option_name, image_url, caption);
		vector::push_back(&mut poll_options, option);		
		i = i + 1;
	};
	
	CreatePollRequest { title, description: desc, duration: set_duration(duration, clock), options: poll_options }
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