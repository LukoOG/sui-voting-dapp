module poll::version

///Consts
const version: u64 = 1;

const EIncompatibleVersion: u64 = 101

///Structs
public struct Version has key, store {
	v: u64,
}

public struct VERSION has drop ()

fun init(otw: VERSION, ctx: &mut TxContext){
	package::claim_and_keep(otw, ctx)
}

public fun upgrade_package(version: &mut Version){
	assert!(version.v < version, EIncompatibleVersion)
	version.v = version + 1
}