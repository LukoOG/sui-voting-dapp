module poll::anon;

use sui::derived_object;

///functions

public fun is_anon_claimed(parent: &UID, key: vector<u8>): bool {
    derived_object::exists(parent, key)
}

/// Claim a derived object for an anonymous vote.
/// Aborts with `err` if the key was already claimed, so the error
/// originates in the caller's module — not inside sui::derived_object.
public fun try_claim_anon(
    parent: &mut UID,
    key: vector<u8>,
    allow_multiple_choice: bool,
    err: u64,
    ctx: &mut TxContext,
): ID {
    if (!allow_multiple_choice) {
        assert!(!is_anon_claimed(parent, key), err);
        let derived_uid = derived_object::claim<vector<u8>>(parent, key);
        let id = object::uid_to_inner(&derived_uid);
        derived_uid.delete();
        id
    } else {
		ctx.fresh_object_address().to_id()
    }
}
