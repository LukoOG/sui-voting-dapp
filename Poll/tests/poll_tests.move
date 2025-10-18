#[test_only]
module poll::poll_tests;
//use poll::poll;
//use sui::table;
use sui::test_scenario as ts;

///Constances
const SYSTEM_ADDRESS: address = @0x1;
const User1: address = @0x2;

const EExpectedFailure: u64 = 6;
const ENotImplemented: u64 = 0;

#[test, expected_failure(abort_code = ::poll::poll_tests::ENotImplemented)]
fun test_poll_fail() {
    abort ENotImplemented
}

#[test, expected_failure(abort_code = EExpectedFailure)]
fun test_create_poll(){
	abort 6;
}