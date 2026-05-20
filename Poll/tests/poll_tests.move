#[test_only, allow(unused_const)]
module poll::poll_tests;

use poll::poll::{Self, Poll};
use poll::version;
use std::debug::print;
use std::string::String;
use sui::clock::{Self, Clock};
use sui::table;
use sui::test_scenario as ts;

const User1: address = @0x2;

const EExpectedFailure: u64 = 6;
const ENotImplemented: u64 = 0;
const EIncorrectPollField: u64 = 0;

#[test, expected_failure(abort_code = ::poll::poll_tests::ENotImplemented)]
fun test_poll_fail() {
    abort ENotImplemented
}
/*
#[test_only]
fun setup_poll(){
	
}
*/
#[test]
fun test_create_poll_request() {
    let mut scenario = ts::begin(User1);

    let clock = clock::create_for_testing(scenario.ctx());
    clock.share_for_testing();
    poll::create_poll_registery_for_testing(scenario.ctx());
    version::create_version_for_testing(scenario.ctx());

    scenario.next_tx(User1);

    //variables
    let title = b"Test Poll".to_string();
    let description = option::some<String>(b"This poll is to test the smart contract".to_string());
    let thumbnail_url = b"This poll is to test the smart contract".to_string();
    let duration: u64 = 34;
    let option_names = vector<String>[b"12".to_string(), b"23".to_string()];
    let option_images = vector<option::Option<String>>[option::none(), option::none()];
    let option_captions = vector<option::Option<String>>[option::none()];
    let config_bools = vector[true, true, true];

    let clock = scenario.take_shared<Clock>();
    let mut registery = scenario.take_shared<poll::PollRegistery>();
    let version = scenario.take_shared<version::Version>();

    let create_poll_request = poll::createCreatePollRequest(
        &version,
        title,
        description,
        thumbnail_url,
        duration,
        option_names,
        option_images,
        option_captions,
        config_bools,
        scenario.ctx(),
    );

    //print(&create_poll_request); //for human crosschecking
    poll::create_poll(&mut registery, create_poll_request, &clock, scenario.ctx());

    scenario.next_tx(User1);
    let mut poll = ts::take_shared<Poll>(&scenario);

    let (id, title, description, creator, start, close, is_active) = poll::poll_fields(&mut poll);

    assert!(id == 0, EIncorrectPollField);
    assert!(title == b"Test Poll".to_string(), EIncorrectPollField);
    assert!(creator == scenario.ctx().sender(), EIncorrectPollField);
    assert!(start == clock.timestamp_ms(), EIncorrectPollField);
    assert!(close == duration, EIncorrectPollField);
    assert!(is_active == true, EIncorrectPollField);

    //asserting options
    assert!(description.is_some(), EIncorrectPollField);
    assert!(
        description.extract() == b"This poll is to test the smart contract".to_string(),
        EIncorrectPollField,
    );

    print(&object::id(&poll));
    print(&object::uid_to_inner(poll::poll_id(&poll)));

    ts::return_shared(registery);
    ts::return_shared(version);
    clock.destroy_for_testing();
    poll::destroy_poll(poll);

    scenario.end();
}

#[test, expected_failure(abort_code = ::poll::version::EIncompatibleVersion)]
fun test_version_check() {
    let mut scenario = ts::begin(User1);

    let clock = clock::create_for_testing(scenario.ctx());
    clock.share_for_testing();
    poll::create_poll_registery_for_testing(scenario.ctx());

    //check is valid on create poll request expected to fail
    version::create_fail_version_for_testing(scenario.ctx());

    scenario.next_tx(User1);

    let clock = scenario.take_shared<Clock>();
    let mut registery = scenario.take_shared<poll::PollRegistery>();
    let version = scenario.take_shared<version::Version>();

    //variables
    let title = b"Test Poll".to_string();
    let description = option::some<String>(b"This poll is to test the smart contract".to_string());
    let thumbnail_url = b"This poll is to test the smart contract".to_string();
    let duration: u64 = 34;
    let option_names = vector<String>[b"12".to_string(), b"23".to_string(), b"34".to_string()];
    let option_images = vector<option::Option<String>>[
        option::none(),
        option::none(),
        option::none(),
    ];
    let option_captions = vector<option::Option<String>>[option::none()];
    let config_bools = vector[true, true, true];

    let create_poll_request = poll::createCreatePollRequest(
        &version,
        title,
        description,
        thumbnail_url,
        duration,
        option_names,
        option_images,
        option_captions,
        config_bools,
        scenario.ctx(),
    );

    //to destroy the create poll request struct
    poll::create_poll(&mut registery, create_poll_request, &clock, scenario.ctx());

    scenario.next_tx(User1);
    let poll = ts::take_shared<Poll>(&scenario);

    ts::return_shared(registery);
    ts::return_shared(version);
    clock.destroy_for_testing();
    poll::destroy_poll(poll);
    scenario.end();
}

#[test]
fun test_wallet_poll_vote() {
    let mut scenario = ts::begin(User1);

    let clock = clock::create_for_testing(scenario.ctx());
    clock.share_for_testing();
    poll::create_poll_registery_for_testing(scenario.ctx());
    version::create_version_for_testing(scenario.ctx());

    scenario.next_tx(User1);

    //variables
    let title = b"Test Poll".to_string();
    let description = option::some<String>(b"This poll is to test the smart contract".to_string());
    let thumbnail_url = b"This poll is to test the smart contract".to_string();
    let duration: u64 = 34;
    let option_names = vector<String>[b"12".to_string(), b"23".to_string()];
    let option_images = vector<option::Option<String>>[option::none(), option::none()];
    let option_captions = vector<option::Option<String>>[option::none()];
    let config_bools = vector[true, true, true];

    let clock = scenario.take_shared<Clock>();
    let mut registery = scenario.take_shared<poll::PollRegistery>();
    let version = scenario.take_shared<version::Version>();

    let create_poll_request = poll::createCreatePollRequest(
        &version,
        title,
        description,
        thumbnail_url,
        duration,
        option_names,
        option_images,
        option_captions,
        config_bools,
        scenario.ctx(),
    );

    //print(&create_poll_request); //for human crosschecking
    poll::create_poll(&mut registery, create_poll_request, &clock, scenario.ctx());

    scenario.next_tx(User1);
    let mut poll: poll::Poll = ts::take_shared<Poll>(&scenario);
    //print(&poll);

    //Voting Process
    let key = option::none();
    let ticket = poll::createVoteTicket(
        &version,
        &mut poll,
        1,
        scenario.ctx().sender(),
        false,
        key,
        1,
    );

    poll::vote_on_poll(&mut poll, ticket, &clock, scenario.ctx());

    scenario.next_tx(User1);
    let receipt = scenario.take_from_sender<poll::VoteReceipt>();

    let (_id, voter, index, weight) = poll::receipt_fields(&receipt);

    assert!(voter == scenario.ctx().sender(), 1);
    assert!(index == 1, 1);
    assert!(weight == 1, 1);
    let (votes_table, _, _) = poll::poll_tables(&poll);

    let count = table::borrow(votes_table, *index); //option index voted for. Expect 1
    let count_2 = table::borrow(votes_table, 0); //option index not voted for. Expect 0

    assert!(count == 1, 1);
    assert!(count_2 == 0, 1);

    //print(voter);
    //print(weight);

    ts::return_shared(registery);
    ts::return_shared(version);
    clock.destroy_for_testing();
    poll::destroy_poll(poll);
    poll::destroy_receipt(receipt);
    scenario.end();
}

// #[test]
// fun test_multiple_option_vote() {
//     let mut scenario = ts::begin(User1);

//     let clock = clock::create_for_testing(scenario.ctx());
//     clock.share_for_testing();
//     poll::create_poll_registery_for_testing(scenario.ctx());
//     version::create_version_for_testing(scenario.ctx());

//     scenario.next_tx(User1);

//     //variables
//     let title = b"Test Poll".to_string();
//     let description = option::some<String>(b"This poll is to test the smart contract".to_string());
//     let thumbnail_url = b"This poll is to test the smart contract".to_string();
//     let duration: u64 = 34;
//     let option_names = vector<String>[b"12".to_string(), b"23".to_string()];
//     let option_images = vector<option::Option<String>>[option::none(), option::none()];
//     let option_captions = vector<option::Option<String>>[option::none()];
//     let config_bools = vector[true, true, true];

//     let clock = scenario.take_shared<Clock>();
//     let mut registery = scenario.take_shared<poll::PollRegistery>();
//     let version = scenario.take_shared<version::Version>();

//     let create_poll_request = poll::createCreatePollRequest(
//         &version,
//         title,
//         description,
//         thumbnail_url,
//         duration,
//         option_names,
//         option_images,
//         option_captions,
//         config_bools,
//         scenario.ctx(),
//     );

//     //print(&create_poll_request); //for human crosschecking
//     poll::create_poll(&mut registery, create_poll_request, &clock, scenario.ctx());

//     scenario.next_tx(User1);
//     let mut poll = ts::take_shared<Poll>(&scenario);
// }

#[test, expected_failure(abort_code = ::poll::poll::EAlreadyVotedPublic)]
fun test_double_wallet_poll_vote() {
    let mut scenario = ts::begin(User1);

    let clock = clock::create_for_testing(scenario.ctx());
    clock.share_for_testing();
    poll::create_poll_registery_for_testing(scenario.ctx());
    version::create_version_for_testing(scenario.ctx());

    scenario.next_tx(User1);

    //variables
    let title = b"Test Poll".to_string();
    let description = option::some<String>(b"This poll is to test the smart contract".to_string());
    let thumbnail_url = b"This poll is to test the smart contract".to_string();
    let duration: u64 = 34;
    let option_names = vector<String>[b"12".to_string(), b"23".to_string()];
    let option_images = vector<option::Option<String>>[option::none(), option::none()];
    let option_captions = vector<option::Option<String>>[option::none()];
    let config_bools = vector[true, true, true];

    let clock = scenario.take_shared<Clock>();
    let mut registery = scenario.take_shared<poll::PollRegistery>();
    let version = scenario.take_shared<version::Version>();

    let create_poll_request = poll::createCreatePollRequest(
        &version,
        title,
        description,
        thumbnail_url,
        duration,
        option_names,
        option_images,
        option_captions,
        config_bools,
        scenario.ctx(),
    );

    //print(&create_poll_request); //for human crosschecking
    poll::create_poll(&mut registery, create_poll_request, &clock, scenario.ctx());

    scenario.next_tx(User1);
    let mut poll = ts::take_shared<Poll>(&scenario);
    //print(&poll);

    //Voting Process
    let key = option::none();
    let ticket = poll::createVoteTicket(
        &version,
        &mut poll,
        1,
        scenario.ctx().sender(),
        false,
        key,
        1,
    );
    let ticket_2 = poll::createVoteTicket(
        &version,
        &mut poll,
        0,
        scenario.ctx().sender(),
        false,
        key,
        1,
    );

    poll::vote_on_poll(&mut poll, ticket, &clock, scenario.ctx());
    poll::vote_on_poll(&mut poll, ticket_2, &clock, scenario.ctx()); //expected to fail

    //print(voter);
    //print(weight);

    //destroy values
    ts::return_shared(registery);
    ts::return_shared(version);
    clock.destroy_for_testing();
    poll::destroy_poll(poll);
    //poll::destroy_receipt(receipt);
    //poll::destroy_receipt(invalid_receipt);
    scenario.end();
}

#[test]
fun test_anonymous_poll_vote() {
    let mut scenario = ts::begin(User1);

    let clock = clock::create_for_testing(scenario.ctx());
    clock.share_for_testing();
    poll::create_poll_registery_for_testing(scenario.ctx());
    version::create_version_for_testing(scenario.ctx());

    scenario.next_tx(User1);

    //variables
    let title = b"Test Poll".to_string();
    let description = option::some<String>(b"This poll is to test the smart contract".to_string());
    let thumbnail_url = b"This poll is to test the smart contract".to_string();
    let duration: u64 = 34;
    let option_names = vector<String>[b"12".to_string(), b"23".to_string()];
    let option_images = vector<option::Option<String>>[option::none(), option::none()];
    let option_captions = vector<option::Option<String>>[option::none()];
    let config_bools = vector[true, true, true];

    let clock = scenario.take_shared<Clock>();
    let mut registery = scenario.take_shared<poll::PollRegistery>();
    let version = scenario.take_shared<version::Version>();

    let create_poll_request = poll::createCreatePollRequest(
        &version,
        title,
        description,
        thumbnail_url,
        duration,
        option_names,
        option_images,
        option_captions,
        config_bools,
        scenario.ctx(),
    );

    poll::create_poll(&mut registery, create_poll_request, &clock, scenario.ctx());

    scenario.next_tx(User1);
    let mut poll = ts::take_shared<Poll>(&scenario);

    //Voting Process
    let key = option::some(b"key for anon");
    let ticket = poll::createVoteTicket(
        &version,
        &mut poll,
        1,
        scenario.ctx().sender(),
        true,
        key,
        1,
    );

    {
        poll::vote_on_poll(&mut poll, ticket, &clock, scenario.ctx());
    };
    scenario.next_tx(User1);
    let receipt = scenario.take_from_sender<poll::VoteReceipt>();
    let (_id, voter, index, weight) = poll::receipt_fields(&receipt);

    assert!(voter == scenario.ctx().sender(), 1);
    assert!(index == 1, 1);
    assert!(weight == 1, 1);
    let (votes_table, voters, anon_voters) = poll::poll_tables(&poll);

    let count = table::borrow(votes_table, *index); //option index voted for. Expect 1
    let count_2 = table::borrow(votes_table, 0); //option index not voted for. Expect 0

    assert!(count == 1, 1);
    assert!(count_2 == 0, 1);

    assert!(table::is_empty(voters), 1);
    assert!(table::length(anon_voters) == 1, 1);

    ts::return_shared(registery);
    ts::return_shared(version);
    clock.destroy_for_testing();
    poll::destroy_poll(poll);
    poll::destroy_receipt(receipt);
    scenario.end();
}

#[test, expected_failure(abort_code = ::poll::poll::EAnonWeightNotOne)]
fun test_anonymous_poll_vote_bad_weight() {
    let mut scenario = ts::begin(User1);

    let clock = clock::create_for_testing(scenario.ctx());
    clock.share_for_testing();
    poll::create_poll_registery_for_testing(scenario.ctx());
    version::create_version_for_testing(scenario.ctx());

    scenario.next_tx(User1);

    //variables
    let title = b"Test Poll".to_string();
    let description = option::some<String>(b"This poll is to test the smart contract".to_string());
    let thumbnail_url = b"This poll is to test the smart contract".to_string();
    let duration: u64 = 34;
    let option_names = vector<String>[b"12".to_string(), b"23".to_string()];
    let option_images = vector<option::Option<String>>[option::none(), option::none()];
    let option_captions = vector<option::Option<String>>[option::none()];
    let config_bools = vector[true, true, true];

    let clock = scenario.take_shared<Clock>();
    let mut registery = scenario.take_shared<poll::PollRegistery>();
    let version = scenario.take_shared<version::Version>();

    let create_poll_request = poll::createCreatePollRequest(
        &version,
        title,
        description,
        thumbnail_url,
        duration,
        option_names,
        option_images,
        option_captions,
        config_bools,
        scenario.ctx(),
    );

    poll::create_poll(&mut registery, create_poll_request, &clock, scenario.ctx());

    scenario.next_tx(User1);
    let mut poll = ts::take_shared<Poll>(&scenario);

    //Voting Process
    let key = option::some(b"key for anon");
    let ticket = poll::createVoteTicket(
        &version,
        &mut poll,
        1,
        scenario.ctx().sender(),
        true,
        key,
        2, //not allowed
    );

    {
        poll::vote_on_poll(&mut poll, ticket, &clock, scenario.ctx()); //expected to error
    };
    scenario.next_tx(User1);
    let receipt = scenario.take_from_sender<poll::VoteReceipt>();

    ts::return_shared(registery);
    ts::return_shared(version);
    clock.destroy_for_testing();
    poll::destroy_poll(poll);
    poll::destroy_receipt(receipt);
    scenario.end();
}
