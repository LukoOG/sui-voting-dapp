module poll::anon;

//imports
use sui::derived_object;
use poll::poll;

///functions
public fun claim_anon(parent: &mut UID, key: vector<u8>): ID{
	let derived_uid = derived_object::claim<vector<u8>>(parent, key);
	let id = object::uid_to_inner(&derived_uid);
	derived_uid.delete();
	id
}