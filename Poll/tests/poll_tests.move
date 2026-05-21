#[test_only, allow(unused_const)]
module poll::poll_tests;

use poll::poll::{Self, Poll};
use poll::poll_test_helpers as helpers;
use poll::version;
use std::string::String;
use sui::clock::Clock;
use sui::table;
use sui::test_scenario as ts;

const User1: address = @0x2;

const ENotImplemented: u64 = 0;
const EIncorrectPollField: u64 = 0;

// ===== Placeholder =====

#[test, expected_failure(abort_code = ::poll::poll_tests::ENotImplemented)]
fun test_poll_fail() {
    abort ENotImplemented
}

// ===== Poll Creation =====

#[test]
fun test_create_poll_request() {
    let mut scenario = ts::begin(User1);

    helpers::setup_env(&mut scenario);
    scenario.next_tx(User1);

    let (clock, mut registery, version) = helpers::take_env(&scenario);
    helpers::create_default_poll(&mut registery, &version, &clock, &mut scenario);

    scenario.next_tx(User1);
    let mut poll = ts::take_shared<Poll>(&scenario);

    // Assert all core poll fields
    let (id, title, description, creator, start, close, is_active) = poll::poll_fields(&mut poll);
    assert!(id == 0, EIncorrectPollField);
    assert!(title == b"Test Poll".to_string(), EIncorrectPollField);
    assert!(creator == scenario.ctx().sender(), EIncorrectPollField);
    assert!(start == clock.timestamp_ms(), EIncorrectPollField);
    assert!(close == 34, EIncorrectPollField);
    assert!(is_active == true, EIncorrectPollField);

    assert!(description.is_some(), EIncorrectPollField);
    assert!(
        description.extract() == b"This poll is to test the smart contract".to_string(),
        EIncorrectPollField,
    );

    helpers::return_env(clock, registery, version);
    poll::destroy_poll(poll);
    scenario.end();
}

// ===== Version Check =====

#[test, expected_failure(abort_code = ::poll::version::EIncompatibleVersion)]
fun test_version_check() {
    let mut scenario = ts::begin(User1);

    helpers::setup_env_bad_version(&mut scenario);
    scenario.next_tx(User1);

    let (clock, mut registery, version) = helpers::take_env(&scenario);

    // createCreatePollRequest checks the version; this should abort here
    helpers::create_default_poll(&mut registery, &version, &clock, &mut scenario);

    helpers::return_env(clock, registery, version);
    scenario.end();
}

// ===== Wallet Voting =====

#[test]
fun test_wallet_poll_vote() {
    let mut scenario = ts::begin(User1);

    helpers::setup_env(&mut scenario);
    scenario.next_tx(User1);

    let (clock, mut registery, version) = helpers::take_env(&scenario);
    helpers::create_default_poll(&mut registery, &version, &clock, &mut scenario);

    scenario.next_tx(User1);
    let mut poll = ts::take_shared<Poll>(&scenario);

    let ticket = helpers::wallet_vote_ticket(&version, &mut poll, 1, scenario.ctx().sender(), 1, &mut scenario);
    poll::vote_on_poll(&mut poll, ticket, &clock, scenario.ctx());

    scenario.next_tx(User1);
    let receipt = scenario.take_from_sender<poll::VoteReceipt>();
    let (_id, voter, index, weight) = poll::receipt_fields(&receipt);

    assert!(voter == scenario.ctx().sender(), 1);
    assert!(index == 1, 1);
    assert!(weight == 1, 1);

    let (votes_table, _, _) = poll::poll_tables(&poll);
    assert!(table::borrow(votes_table, *index) == 1, 1); // voted option
    assert!(table::borrow(votes_table, 0) == 0, 1); // unvoted option

    helpers::return_env(clock, registery, version);
    poll::destroy_poll(poll);
    poll::destroy_receipt(receipt);
    scenario.end();
}

#[test]
fun test_double_wallet_poll_vote() {
    let mut scenario = ts::begin(User1);

    helpers::setup_env(&mut scenario);
    scenario.next_tx(User1);

    let (clock, mut registery, version) = helpers::take_env(&scenario);
    helpers::create_default_poll(&mut registery, &version, &clock, &mut scenario);

    scenario.next_tx(User1);
    let mut poll = ts::take_shared<Poll>(&scenario);

    let ticket1 = helpers::wallet_vote_ticket(&version, &mut poll, 0, scenario.ctx().sender(), 1, &mut scenario);
    let ticket2 = helpers::wallet_vote_ticket(&version, &mut poll, 1, scenario.ctx().sender(), 1, &mut scenario);

    poll::vote_on_poll(&mut poll, ticket1, &clock, scenario.ctx());
    scenario.next_tx(User1);
    let receipt1 = scenario.take_from_sender<poll::VoteReceipt>();

    poll::vote_on_poll(&mut poll, ticket2, &clock, scenario.ctx());
    scenario.next_tx(User1);
    let receipt2 = scenario.take_from_sender<poll::VoteReceipt>();

    let (_id, voter, index, weight) = poll::receipt_fields(&receipt1);
    assert!(voter == scenario.ctx().sender(), 1);
    assert!(index == 0, 1);
    assert!(weight == 1, 1);

    let (_id, voter, index, weight) = poll::receipt_fields(&receipt2);

    assert!(voter == scenario.ctx().sender(), 1);
    assert!(index == 1, 1);
    assert!(weight == 1, 1);

    //2 options: both should be voted
    let (votes_table, _, _) = poll::poll_tables(&poll);
    assert!(table::borrow(votes_table, 0) == 1, 1); // voted option
    assert!(table::borrow(votes_table, 1) == 1, 1); // voted option

    helpers::return_env(clock, registery, version);
    poll::destroy_poll(poll);
    poll::destroy_receipt(receipt1);
    poll::destroy_receipt(receipt2);
    scenario.end();
}

#[test, expected_failure(abort_code = ::poll::poll::EAlreadyVotedPublic)]
fun test_double_wallet_poll_vote_fail() {
    let mut scenario = ts::begin(User1);

    helpers::setup_env(&mut scenario);
    scenario.next_tx(User1);

    let (clock, mut registery, version) = helpers::take_env(&scenario);

    // multiple-choice is false (second bool) to trigger EAlreadyVotedPublic
    helpers::create_poll_with_config(
        &mut registery,
        &version,
        &clock,
        vector[true, false, true],
        &mut scenario,
    );

    scenario.next_tx(User1);
    let mut poll = ts::take_shared<Poll>(&scenario);

    let ticket_1 = helpers::wallet_vote_ticket(&version, &mut poll, 1, scenario.ctx().sender(), 1, &mut scenario);
    let ticket_2 = helpers::wallet_vote_ticket(&version, &mut poll, 0, scenario.ctx().sender(), 1, &mut scenario);

    poll::vote_on_poll(&mut poll, ticket_1, &clock, scenario.ctx());
    poll::vote_on_poll(&mut poll, ticket_2, &clock, scenario.ctx()); // expected to abort

    helpers::return_env(clock, registery, version);
    poll::destroy_poll(poll);
    scenario.end();
}

// ===== Anonymous Voting =====

#[test]
fun test_anonymous_poll_vote() {
    let mut scenario = ts::begin(User1);

    helpers::setup_env(&mut scenario);
    scenario.next_tx(User1);

    let (clock, mut registery, version) = helpers::take_env(&scenario);
    helpers::create_default_poll(&mut registery, &version, &clock, &mut scenario);

    scenario.next_tx(User1);
    let mut poll = ts::take_shared<Poll>(&scenario);

    let ticket = helpers::anon_vote_ticket(
        &version,
        &mut poll,
        1,
        scenario.ctx().sender(),
        b"key for anon",
        1,
        &mut scenario
    );
    poll::vote_on_poll(&mut poll, ticket, &clock, scenario.ctx());

    scenario.next_tx(User1);
    let receipt = scenario.take_from_sender<poll::VoteReceipt>();
    let (_id, voter, index, weight) = poll::receipt_fields(&receipt);

    assert!(voter == scenario.ctx().sender(), 1);
    assert!(index == 1, 1);
    assert!(weight == 1, 1);

    let (votes_table, public_voters, anon_voters) = poll::poll_tables(&poll);
    assert!(table::borrow(votes_table, *index) == 1, 1);
    assert!(table::borrow(votes_table, 0) == 0, 1);

    // Anonymous vote: public voters table stays empty, anon table grows
    assert!(table::is_empty(public_voters), 1);
    assert!(table::length(anon_voters) == 1, 1);

    helpers::return_env(clock, registery, version);
    poll::destroy_poll(poll);
    poll::destroy_receipt(receipt);
    scenario.end();
}

#[test]
fun test_double_anonymous_poll_vote() {
    let mut scenario = ts::begin(User1);

    helpers::setup_env(&mut scenario);
    scenario.next_tx(User1);

    let (clock, mut registery, version) = helpers::take_env(&scenario);
    helpers::create_default_poll(&mut registery, &version, &clock, &mut scenario);
    
    scenario.next_tx(User1);
    let mut poll = ts::take_shared<Poll>(&scenario);

    let ticket1 = helpers::anon_vote_ticket(
        &version,
        &mut poll,
        0,
        scenario.ctx().sender(),
        b"key for anon",
        1,
        &mut scenario
    );

    let ticket2 = helpers::anon_vote_ticket(
        &version,
        &mut poll,
        1,
        scenario.ctx().sender(),
        b"key for anon",
        1,
        &mut scenario
    );

    poll::vote_on_poll(&mut poll, ticket1, &clock, scenario.ctx());
    scenario.next_tx(User1);
    let receipt1 = scenario.take_from_sender<poll::VoteReceipt>();

    poll::vote_on_poll(&mut poll, ticket2, &clock, scenario.ctx());
    scenario.next_tx(User1);
    let receipt2 = scenario.take_from_sender<poll::VoteReceipt>();

    let (_id, voter, index, weight) = poll::receipt_fields(&receipt1);

    assert!(voter == scenario.ctx().sender(), 1);
    assert!(index == 0, 1);
    assert!(weight == 1, 1);

    let (_id, voter, index, weight) = poll::receipt_fields(&receipt2);

    assert!(voter == scenario.ctx().sender(), 1);
    assert!(index == 1, 1);
    assert!(weight == 1, 1);

    let (votes_table, public_voters, anon_voters) = poll::poll_tables(&poll);
    assert!(table::borrow(votes_table, 0) == 1, 1); //voted option
    assert!(table::borrow(votes_table, 1) == 1, 1); //voted option

    // Anonymous vote: public voters table stays empty, anon table grows
    assert!(table::is_empty(public_voters), 1);
    assert!(table::length(anon_voters) == 2, 1); //two votes

    helpers::return_env(clock, registery, version);
    poll::destroy_poll(poll);
    poll::destroy_receipt(receipt1);
    poll::destroy_receipt(receipt2);
    scenario.end();
}

//anon module calls the error
#[test, expected_failure(abort_code = 17)]
fun test_double_anonymous_poll_vote_fail() {
    let mut scenario = ts::begin(User1);

    helpers::setup_env(&mut scenario);
    scenario.next_tx(User1);

    let (clock, mut registery, version) = helpers::take_env(&scenario);
    
    // multiple-choice is false (second bool) to trigger EAlreadyVotedAnon
    helpers::create_poll_with_config(
        &mut registery,
        &version,
        &clock,
        vector[true, false, true],
        &mut scenario,
    );
    scenario.next_tx(User1);
    let mut poll = ts::take_shared<Poll>(&scenario);

    let ticket1 = helpers::anon_vote_ticket(
        &version,
        &mut poll,
        0,
        scenario.ctx().sender(),
        b"key for anon",
        1,
        &mut scenario
    );
    let ticket2 = helpers::anon_vote_ticket(
        &version,
        &mut poll,
        1,
        scenario.ctx().sender(),
        b"key for anon", 
        1,
        &mut scenario
    );
    poll::vote_on_poll(&mut poll, ticket1, &clock, scenario.ctx());
    poll::vote_on_poll(&mut poll, ticket2, &clock, scenario.ctx()); //expected to abort

    helpers::return_env(clock, registery, version);
    poll::destroy_poll(poll);
    scenario.end();
}

#[test, expected_failure(abort_code = ::poll::poll::EAnonWeightNotOne)]
fun test_anonymous_poll_vote_bad_weight() {
    let mut scenario = ts::begin(User1);

    helpers::setup_env(&mut scenario);
    scenario.next_tx(User1);

    let (clock, mut registery, version) = helpers::take_env(&scenario);
    helpers::create_default_poll(&mut registery, &version, &clock, &mut scenario);

    scenario.next_tx(User1);
    let mut poll = ts::take_shared<Poll>(&scenario);

    // Weight of 2 is not allowed for anonymous votes
    let ticket = helpers::anon_vote_ticket(
        &version,
        &mut poll,
        1,
        scenario.ctx().sender(),
        b"key for anon",
        2, //wrong weight
        &mut scenario
    );
    poll::vote_on_poll(&mut poll, ticket, &clock, scenario.ctx()); // expected to abort

    helpers::return_env(clock, registery, version);
    poll::destroy_poll(poll);
    scenario.end();
}
