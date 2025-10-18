module poll::version;

use sui::package;

///Consts
const PACKAGE_VERSION: u64 = 1;

const EIncompatibleVersion: u64 = 11;

///Structs
public struct Version has key, store {
	id: UID,
	v: u64,
}

public struct VERSION has drop ()

fun init(otw: VERSION, ctx: &mut TxContext){
	package::claim_and_keep(otw, ctx);
	transfer::transfer( Version{ id: object::new(ctx), v: 1 } ,ctx.sender())
}

public fun check_is_valid(self: &Version, _ctx: &mut TxContext){
	assert!(self.v == PACKAGE_VERSION, EIncompatibleVersion)
}

public fun upgrade_package(self: &mut Version){
	assert!(self.v <= PACKAGE_VERSION, EIncompatibleVersion);
	self.v = PACKAGE_VERSION + 1;
}