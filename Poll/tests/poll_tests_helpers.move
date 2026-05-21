#[test_only]
module poll::poll_test_helpers;

use poll::poll::{Self, Poll, PollRegistery, VoteTicket};
use poll::version::{Self, Version};
use std::string::String;
use sui::clock::{Self, Clock};
use sui::test_scenario::{Self as ts, Scenario};

// ===== Default Poll Parameters =====
// Centralised so every test uses the same baseline.
// Override individual fields in tests that care about them.

const DEFAULT_TITLE: vector<u8> = b"Test Poll";
const DEFAULT_DESCRIPTION: vector<u8> = b"This poll is to test the smart contract";
const DEFAULT_THUMBNAIL: vector<u8> = b"https://example.com/thumbnail.png";
const DEFAULT_DURATION: u64 = 34;

// ===== Environment Setup =====

/// Initialise shared objects needed by every test.
/// Call at the start of a scenario, then `scenario.next_tx(sender)` before
/// taking any shared objects.
public fun setup_env(scenario: &mut Scenario) {
    let clock = clock::create_for_testing(scenario.ctx());
    clock.share_for_testing();
    poll::create_poll_registery_for_testing(scenario.ctx());
    version::create_version_for_testing(scenario.ctx());
}

/// Like `setup_env` but uses a version object that will fail the version check.
/// Useful for `expected_failure` version-check tests.
public fun setup_env_bad_version(scenario: &mut Scenario) {
    let clock = clock::create_for_testing(scenario.ctx());
    clock.share_for_testing();
    poll::create_poll_registery_for_testing(scenario.ctx());
    version::create_fail_version_for_testing(scenario.ctx());
}

// ===== Shared Object Accessors =====

/// Take all three shared env objects in one call.
/// Caller is responsible for returning/destroying them.
public fun take_env(scenario: &Scenario): (Clock, PollRegistery, Version) {
    let clock = scenario.take_shared<Clock>();
    let registery = scenario.take_shared<PollRegistery>();
    let version = scenario.take_shared<Version>();
    (clock, registery, version)
}

// ===== Poll Creation =====

/// Build and submit a create-poll request using the default parameters.
/// Does NOT call `next_tx` — the caller controls transaction boundaries.
public fun create_default_poll(
    registery: &mut PollRegistery,
    version: &Version,
    clock: &Clock,
    scenario: &mut Scenario,
) {
    let request = poll::createCreatePollRequest(
        version,
        DEFAULT_TITLE.to_string(),
        option::some<String>(DEFAULT_DESCRIPTION.to_string()),
        DEFAULT_THUMBNAIL.to_string(),
        DEFAULT_DURATION,
        default_option_names(),
        default_option_images(),
        default_option_captions(),
        default_config_bools(),
        scenario.ctx(),
    );
    poll::create_poll(registery, request, clock, scenario.ctx());
}

/// Same as `create_default_poll` but lets you override `config_bools`.
/// Useful for tests that need a specific voting configuration (e.g. no
/// multiple-choice) without duplicating all the other parameters.
public fun create_poll_with_config(
    registery: &mut PollRegistery,
    version: &Version,
    clock: &Clock,
    config_bools: vector<bool>,
    scenario: &mut Scenario,
) {
    let request = poll::createCreatePollRequest(
        version,
        DEFAULT_TITLE.to_string(),
        option::some<String>(DEFAULT_DESCRIPTION.to_string()),
        DEFAULT_THUMBNAIL.to_string(),
        DEFAULT_DURATION,
        default_option_names(),
        default_option_images(),
        default_option_captions(),
        config_bools,
        scenario.ctx(),
    );
    poll::create_poll(registery, request, clock, scenario.ctx());
}

// ===== Vote Ticket Helpers =====

/// Create a standard wallet (non-anonymous) vote ticket.
public fun wallet_vote_ticket(
    version: &Version,
    poll: &mut Poll,
    option_index: u64,
    voter: address,
    weight: u8,
    scenario: &mut Scenario,
): VoteTicket {
    poll::createVoteTicket(
        version,
        poll,
        option_index,
        voter,
        false,          // not anonymous
        option::none(), // no key needed
        weight,
        scenario.ctx()
    )
}

/// Create an anonymous vote ticket.
public fun anon_vote_ticket(
    version: &Version,
    poll: &mut Poll,
    option_index: u64,
    voter: address,
    key: vector<u8>,
    weight: u8,
    scenario: &mut Scenario
): VoteTicket {
    poll::createVoteTicket(
        version,
        poll,
        option_index,
        voter,
        true,
        option::some(key),
        weight,
        scenario.ctx()
    )
}

// ===== Teardown =====

/// Return the shared env objects and destroy the clock.
/// Call at the end of every test that used `take_env`.
public fun return_env(clock: Clock, registery: PollRegistery, version: Version) {
    ts::return_shared(registery);
    ts::return_shared(version);
    clock.destroy_for_testing();
}

// ===== Private Defaults =====

fun default_option_names(): vector<String> {
    vector[b"Option A".to_string(), b"Option B".to_string()]
}

fun default_option_images(): vector<option::Option<String>> {
    vector[option::none(), option::none()]
}

fun default_option_captions(): vector<option::Option<String>> {
    vector[option::none()]
}

fun default_config_bools(): vector<bool> {
    vector[true, true, true]
}
