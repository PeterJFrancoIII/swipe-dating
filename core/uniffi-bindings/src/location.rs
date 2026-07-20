//! Coarse region helpers — precise coordinates never cross FFI.

use dating_matching::{distance_band_label, to_coarse_region, DistanceBand};

#[derive(Debug, Clone, uniffi::Record)]
pub struct CoarseRegionSummary {
    pub cell: String,
    pub band_label: String,
}

fn band_to_label(band: DistanceBand) -> String {
    distance_band_label(band).to_string()
}

/// Derive a coarse discovery cell from lat/lon with deterministic jitter.
#[uniffi::export]
pub fn coarse_region_from_lat_lon(lat: f64, lon: f64, jitter_seed: u64) -> CoarseRegionSummary {
    let region = to_coarse_region(lat, lon, jitter_seed);
    CoarseRegionSummary {
        cell: region.cell,
        band_label: band_to_label(region.band),
    }
}
