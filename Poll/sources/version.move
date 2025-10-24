module poll::version;

use sui::package::{Self, Publisher};

///Consts
const PACKAGE_VERSION: u64 = 3; //always update before running cli upgrade command

const EIncompatibleVersion: u64 = 11;

///Structs
public struct Version has key, store {
	id: UID,
	v: u64,
}

public struct VERSION has drop ()

fun init(otw: VERSION, ctx: &mut TxContext){
	package::claim_and_keep(otw, ctx);
	transfer::share_object( Version{ id: object::new(ctx), v: 1 })
}

public fun check_is_valid(self: &Version){
	assert!(self.v == PACKAGE_VERSION, EIncompatibleVersion)
}

public fun upgrade_package(self: &mut Version, pub: &Publisher){
	assert!(self.v <= PACKAGE_VERSION, EIncompatibleVersion);
	pub.from_package<Version>();
	self.v = PACKAGE_VERSION;
}

#[test_only]
use sui::test_scenario as ts;

//#[test_only]
//use std::debug::print;

#[test_only]
const Admin: address = @0xBAB434;

#[test_only]
public fun create_version_for_testing(ctx: &mut TxContext) { transfer::share_object( Version{ id: object::new(ctx), v: 2 }) }

#[test_only]
public fun create_fail_version_for_testing(ctx: &mut TxContext) { transfer::share_object( Version{ id: object::new(ctx), v: 0 })  }


#[test_only]
fun init_for_testing(ctx: &mut TxContext){
	init(VERSION(), ctx)
}

#[test]
fun test_init(){
	let mut scenario = ts::begin(Admin);
	
	{
		init_for_testing(scenario.ctx())
	};
	scenario.next_tx(Admin);
	
	assert!(ts::has_most_recent_shared<Version>(), 1);
	
	scenario.end();
}