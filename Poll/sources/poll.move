module poll::poll;

use std::string::{String};
use sui::table;
use sui::package::{Self, Publisher};
use sui::display;
use sui::clock::Clock;

///Errors
const EInvalidOption: u64 = 11;
const EInvalidNoOfOptions: u64 = 12;
const EUnequalLength :u64 = 13;
const EInvalidConfigLength: u64 = 15;
const EAlreadyVoted: u64 = 16;

const EPollClosed: u64 = 102;
const EPollNotActive: u64 = 103;
const EPollNotStarted: u64 = 105;


///constants
const Poll_Config_Max_Length: u8 = 3; //current number of fields in pollconfig struct

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

public struct PollConfig has store, drop {
		//setting fields
	allow_anon_vote: bool, //allow creators to allow or prevent anon users from voting
	allow_multiple_choice: bool,
	allow_weighted: bool, //wallet votes count more than anon votes
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
	poll_config: PollConfig,
	options: vector<PollOption>,
	votes: table::Table<u64, u64>, //option index → voter count
	voters: table::Table<address, u64>, //web3 voters address → option index
	anon_voters: table::Table<ID, u64>, //anonymous voters → option index
}


public struct PollOption has store, drop {
    id: u64, //option index
    name: String,
    image_url: Option<String>,
    caption: Option<String>,
}

public struct VoteTicket {
	option_index: u64,
	owner: address,
	is_anon: bool,
	anon: option::Option<ID>,
	weight: u8,
}

#[allow(unused_field)]
public struct VoteReceipt has key {
	id: UID,
	poll_id: ID,
	voter: address,
	option_index: u64,
	weight: u8,
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
	poll_config: PollConfig,
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

fun setConfiguration(poll_config_bools: vector<bool>):PollConfig{
	assert!(poll_config_bools.length() == Poll_Config_Max_Length as u64, EInvalidConfigLength);
	PollConfig{
		allow_anon_vote: *poll_config_bools.borrow(0),
		allow_multiple_choice: *poll_config_bools.borrow(1),
		allow_weighted: *poll_config_bools.borrow(2),
	}
}

fun set_duration(d: u64, clock: &Clock): u64{
	clock.timestamp_ms() + d
}

//request constructors
public fun createCreatePollRequest(
	version: &poll::version::Version,
	title: String, 
	desc: option::Option<String>, 
	thumbnail_url: String,
	duration: u64,
	option_names: vector<String>,
    option_images: vector<Option<String>>,
    option_captions: vector<Option<String>>,
	poll_config_bools: vector<bool>,
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
	
	CreatePollRequest { title, description: desc, thumbnail_url, duration, options: poll_options, poll_config: setConfiguration(poll_config_bools) }
}

public fun createVoteTicket(version: &poll::version::Version, poll: &mut Poll,option: u64, owner: address, is_anon: bool, mut key: option::Option<vector<u8>>, weight: u8 ): VoteTicket {
	poll::version::check_is_valid(version);
	let anon_id = if(is_anon){ 
		let extracted_key = option::extract(&mut key);		
		let id = poll::anon::claim_anon(&mut poll.id, extracted_key);
		option::some(id)
	} else { 
		option::none() 
	};
	VoteTicket{ option_index: option, owner, is_anon, anon: anon_id, weight }	
}

//Tx functions
public fun create_poll(registery: &mut PollRegistery, createPollRequest: CreatePollRequest, clock: &Clock, ctx: &mut TxContext): Poll {
	//assert!();
	let CreatePollRequest { title, description, thumbnail_url, duration, options, poll_config } = createPollRequest; //input validation done on request constructor
	
	//Build votes table
	let mut index = 0;
	let length = options.length();
	let mut votes_table = table::new<u64, u64>(ctx);
	
	while(index < length){
		table::add<u64, u64>(&mut votes_table, copy index, 0);
		index = index+ 1;
	};
	
	let poll = Poll { 
				id: object::new(ctx),
				poll_id: registery.next_poll_id,
				title, description, thumbnail_url,
				creator: ctx.sender(), 
				is_active: true, 
				start_time: clock.timestamp_ms(), 
				close_time: set_duration(duration, clock),
				poll_config,
				options,
				votes: votes_table,
				voters: table::new<address, u64>(ctx),
				anon_voters: table::new<ID, u64>(ctx),
	};
					
	let poll_object_id = object::uid_to_inner(&poll.id);	
	table::add<u64, ID>(&mut registery.polls, registery.next_poll_id, poll_object_id);
	registery.next_poll_id = registery.next_poll_id + 1;
	
	poll
}

public fun vote_on_poll(poll: &mut Poll, ticket: VoteTicket, clock: &Clock, ctx: &mut TxContext){
	let VoteTicket { option_index, owner, is_anon, mut anon, weight } = ticket;
	
	assert!(poll.is_active, EPollNotActive);
    let now = clock.timestamp_ms();
    assert!(now >= poll.start_time, EPollNotStarted);
    assert!(now < poll.close_time, EPollClosed);
	
	assert!(option_index < vector::length(&poll.options), EInvalidOption);

	
	if(is_anon == false){
		assert!(!table::contains(&poll.voters, owner), EAlreadyVoted); //prevent double voting
		table::add(&mut poll.voters, owner, option_index);
	}else{
		let anon_id = anon.extract();
		assert!(!table::contains(&poll.anon_voters, anon_id), EAlreadyVoted);
		assert!(weight == 1, 12); //anonymous weight must always be 1
		table::add(&mut poll.anon_voters, anon_id, option_index);
	};
	
	let count = table::borrow_mut<u64, u64>(&mut poll.votes, option_index);
    *count = *count + (1 * weight as u64);

	let receipt = VoteReceipt { id: object::new(ctx), poll_id: object::uid_to_inner(&poll.id), voter: owner, option_index, weight };
	transfer::transfer(receipt, owner);
}

entry fun close_poll(_ctx: &mut TxContext){
	abort 0
}

public(package) fun borrow_mut_poll_id(self: &mut Poll): &mut UID { &mut self.id }

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
public(package) fun poll_tables(self: &Poll): (&table::Table<u64, u64>, &table::Table<address, u64>, &table::Table<ID, u64>) {
	(&self.votes, &self.voters, &self.anon_voters)
}

public(package) fun receipt_fields(self: &VoteReceipt): (&ID, &address, &u64, &u8) { 
	(&self.poll_id, &self.voter, &self.option_index, &self.weight)
}

#[test_only]
public(package) fun destroy_poll(poll: Poll) { 
	let Poll { id, voters, votes, anon_voters, .. } = poll;
	table::drop(voters);
	table::drop(votes);
	table::drop(anon_voters);
	id.delete();
}

#[test_only]
public(package) fun destroy_receipt(receipt: VoteReceipt) { 
	let VoteReceipt { id, .. } = receipt;
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