//! Print a staging presence lease JSON to stdout (local smoke helper).

use dating_uniffi_bindings::tooling::{
    build_tooling_presence_lease_json, generate_tooling_identity,
};

fn main() {
    let handle = generate_tooling_identity();
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);
    let json =
        build_tooling_presence_lease_json(&handle, "us-west-coarse", now, 120).expect("lease");
    println!("{json}");
}
