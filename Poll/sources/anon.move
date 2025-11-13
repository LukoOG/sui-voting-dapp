module poll::anon;

//imports
use sui::derived_object;
use poll::poll;

//structs
public struct Anon has key, store{ //destroyed on vote
	id: UID,
}

///functions
public fun claim_anon(parent: &mut poll::Poll, key: u64): Anon{
	let derived_uid = derived_object::claim<u64>(poll::borrow_mut_poll_id(parent), key);
	Anon { id: derived_uid }
}