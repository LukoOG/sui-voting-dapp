module poll::poll;

use std::string::{String};
use sui::table;


///Structs
//package One time witness
public struct POLL has drop ()

public struct Poll has key{
	id: UID,
	name: String,
	voters: table::Table<>,
}

public struct PollCap has key, store{
	id: UID,
}

///functions
fun init(otw: POLL(), ctx: &mut TxContext){
	package.claim_and_keep(otw, ctx)
}

public create_poll(name: String, ctx: &mut TxContext): Poll {
	let poll = Poll {
		id: object::new(ctx),
		name
	}
	
	//transfer from the client
	poll 
}

public vote_on_poll(ctx: &mut TxContext){
	
}

///tests