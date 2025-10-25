module poll::poll;

use std::string::{String};
use sui::table;
use sui::package;
use sui::display;
use sui::clock::Clock;

const EInvalidNoOfOptions: u64 = 12;
const EUnequalLength :u64 = 13;

//package One time witness
public struct POLL has drop ()

#[allow(unused_field)]
public struct AnonVoteCap has key {
	id: UID,
	owner: address,
}

#[allow(unused_field)]
public struct PollRegistery has key{
	id: UID,
	owner: address,
	polls: table::Table<u64, ID>, //poll index → Poll object reference
	next_poll_id: u64,
}

//add thumbnail field when moving to testnet
public struct Poll has key, store{
	id: UID,
	poll_id: u64, //registery index
	title: String,
	description: option::Option<String>,
	thumbnail_url: String,
	creator: address,
	is_active: bool,
	start_time: u64,
	close_time: u64,
	options: vector<PollOption>,
	votes: table::Table<u64, u64>, //option index → voter count
	voters: table::Table<address, u64>, //web3 voters address → option index
	anon_voters: table::Table<ID, u64>, //anonymous voters → option index
}


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

//events
public struct PollCreated {}

//hot potatoes
public struct CreatePollRequest {
	title: String,
	description: Option<String>,
	thumbnail_url: String,
	duration: u64,
	options: vector<PollOption>,
}

///functions
fun init(otw: POLL, ctx: &mut TxContext){
	let publisher: Publisher = package::claim(otw, ctx);
	
	//display object
	let keys = vector[
		b"name".to_string(),
		b"description".to_string(),
		b"image".to_string(),
		b"creator".to_string(),
		b"status".to_string(),
		b"timing".to_string(),
	];

	let values = vector[
		b"{title}".to_string(),
		b"{description}".to_string(),
		b"{thumbnail_url}".to_string(),
		b"{creator}".to_string(),
		b"{is_active}".to_string(),
		b"Starts at {start_time}, closes at {close_time}".to_string(),
	];
	
	let mut display = display::new_with_fields<Poll>(
        &publisher, keys, values, ctx
    );

    // Commit first version of `Display` to apply changes.
    display.update_version();
	
	let registery = PollRegistery{ id: object::new(ctx), owner: ctx.sender(), polls: table::new<u64, ID>(ctx), next_poll_id: 0 };
	transfer::share_object(registery);
	transfer::public_transfer(publisher, ctx.sender());
	transfer::public_transfer(display, ctx.sender());
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
	version: &poll::version::Version,
	title: String, 
	desc: option::Option<String>, 
	thumbnail_url: String,
	duration: u64,
	option_names: vector<String>,
    option_images: vector<Option<String>>,
    option_captions: vector<Option<String>>,
	_ctx: &mut TxContext
): CreatePollRequest{
	poll::version::check_is_valid(version);
	assert!(option_names.length() > 1, EInvalidNoOfOptions);
	if(!option_images.is_empty()){ assert!(option_images.length() == option_names.length(), EUnequalLength); };
	
	let mut poll_options: vector<PollOption> = vector::empty<PollOption>();
	let len: u64 = option_names.length();
	let mut i: u64 = 0;
	while (i < len) {
		let image_url = if(i < option_images.length()) { *option_images.borrow(i) } else { option::none<String>() };
		let caption = if(i < option_captions.length()) { *option_captions.borrow(i)  } else { option::none<String>() };
		let option_name = *option_names.borrow(i);
		let option = createPollOption(&i, option_name, image_url, caption);
		vector::push_back(&mut poll_options, option);		
		i = i + 1;
	};
	
	CreatePollRequest { title, description: desc, thumbnail_url, duration, options: poll_options }
}

//this will fail if the create hot potato constructor didn't succeed
public fun create_poll(registery: &mut PollRegistery, createPollRequest: CreatePollRequest, clock: &Clock, ctx: &mut TxContext): Poll {
	//assert!();
	let CreatePollRequest { title, description, thumbnail_url, duration, options } = createPollRequest;


	let poll = Poll { 
				id: object::new(ctx),
				poll_id: registery.next_poll_id,
				title, description, thumbnail_url,
				creator: ctx.sender(), 
				is_active: true, 
				start_time: clock.timestamp_ms(), 
				close_time: set_duration(duration, clock),
				options,
				votes: table::new<u64, u64>(ctx),
				voters: table::new<address, u64>(ctx),
				anon_voters: table::new<ID, u64>(ctx),
	};
					
	let poll_object_id = object::uid_to_inner(&poll.id);	
	table::add<u64, ID>(&mut registery.polls, registery.next_poll_id, poll_object_id);
	registery.next_poll_id = registery.next_poll_id + 1;
	
	poll
}

entry fun vote_on_poll(_ctx: &mut TxContext){
	abort 0
}

entry fun close_poll(_ctx: &mut TxContext){
	abort 0
}

#[test_only]
use sui::package::Publisher;

#[test_only]
use sui::test_scenario as ts;

//#[test_only]
//use std::debug::print;

#[test_only]
const Admin: address = @0xBAB434;

//test functions
#[test_only]
fun init_for_testing(ctx: &mut TxContext){
	init(POLL(), ctx)
}

#[test_only]
public(package) fun create_poll_registery_for_testing(ctx: &mut TxContext){
	transfer::share_object(PollRegistery{ id: object::new(ctx), owner: ctx.sender(), polls: table::new<u64, ID>(ctx), next_poll_id: 0 })
}

#[test_only]
public(package) fun poll_id(self: &Poll): &UID { &self.id }

#[test_only]
public(package) fun poll_fields(self: &mut Poll): (&u64, &String, &mut option::Option<String>, &address, &u64, &u64, &bool) { 
	(&self.poll_id, &self.title, &mut self.description, &self.creator, &self.start_time, &self.close_time, &self.is_active)
}

#[test_only]
public(package) fun destroy_poll(poll: Poll) { 
	let Poll { id, voters, votes, anon_voters, .. } = poll;
	table::drop(voters);
	table::drop(votes);
	table::drop(anon_voters);
	id.delete();
}

#[test]
fun test_init(){
	let mut scenario = ts::begin(Admin);
	{
		init_for_testing(scenario.ctx());
	};
	scenario.next_tx(Admin);
	
	assert!(scenario.has_most_recent_for_sender<Publisher>(), 1);
	assert!(ts::has_most_recent_shared<PollRegistery>(), 1);
	
	scenario.end();
}