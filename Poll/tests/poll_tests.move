#[test_only]
module poll::poll_tests;

use poll::poll;
//use sui::table;
use sui::clock::{Self, Clock};
use sui::test_scenario as ts;
use std::debug::print;
use std::string::String;

const User1: address = @0x2;

const EExpectedFailure: u64 = 6;
const ENotImplemented: u64 = 0;

#[test, expected_failure(abort_code = ::poll::poll_tests::ENotImplemented)]
fun test_poll_fail() {
	abort ENotImplemented
}

#[test]
fun test_create_poll_request(){
	let mut scenario = ts::begin(User1);
	
	let clock = clock::create_for_testing(scenario.ctx());
	clock.share_for_testing();
	
	scenario.next_tx(User1);
	
	//variables
	let title = b"Test Poll".to_string();
	let description = option::some<String>(b"This poll is to test the smart contract".to_string());
	let duration: u64 = 34;
	let option_names = vector<String>[b"12".to_string(), b"23".to_string(), b"34".to_string()];
	let option_images = vector<option::Option<String>>[option::none(), option::none(), option::none()];
	let option_captions = vector<option::Option<String>>[option::none()];
	let clock = scenario.take_shared<Clock>();
	
	let create_poll_request = poll::createCreatePollRequest(
		title,
		description,
		duration,
		option_names,
		option_images,
		option_captions,
		&clock,
		scenario.ctx()
	);
	clock.destroy_for_testing();
	print(&create_poll_request); //for human crosschecking
	
	scenario.end();
}