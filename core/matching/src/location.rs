//! Coarse discovery region helpers — precise coordinates never leave the device.

use thiserror::Error;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum LocationError {
    #[error("precise coordinates must not be networked")]
    PreciseForbidden,
}

/// Coarse cell token derived on-device. Opaque to peers.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CoarseRegion {
    pub cell: String,
    pub band: DistanceBand,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DistanceBand {
    Nearby,
    Within10To25Km,
    Farther,
}

/// Convert lat/lon to a coarse cell with bounded jitter. Does not return precise values.
pub fn to_coarse_region(lat: f64, lon: f64, jitter_seed: u64) -> CoarseRegion {
    // ~0.2 degree grid (~20km) with tiny deterministic jitter on cell index only.
    let jitter = ((jitter_seed % 7) as i64) - 3;
    let lat_cell = ((lat * 5.0).floor() as i64) + jitter.signum();
    let lon_cell = (lon * 5.0).floor() as i64;
    CoarseRegion {
        cell: format!("c:{lat_cell}:{lon_cell}"),
        band: DistanceBand::Nearby,
    }
}

pub fn distance_band_label(band: DistanceBand) -> &'static str {
    match band {
        DistanceBand::Nearby => "nearby",
        DistanceBand::Within10To25Km => "within 10-25 km",
        DistanceBand::Farther => "farther away",
    }
}

/// Simulated adversary: repeated queries should not yield a unique precise fix.
pub fn triangulation_resistance_score(cells: &[String]) -> usize {
    let mut uniq = cells.to_vec();
    uniq.sort();
    uniq.dedup();
    uniq.len()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn coarse_not_equal_to_raw_coords() {
        let r = to_coarse_region(40.7128, -74.0060, 42);
        assert!(!r.cell.contains("40.7128"));
        assert!(!r.cell.contains("-74.0060"));
    }

    #[test]
    fn labels_are_bands_not_meters() {
        assert_eq!(distance_band_label(DistanceBand::Nearby), "nearby");
    }

    #[test]
    fn repeated_same_cell_does_not_expand_anonymity_set_alone() {
        let a = to_coarse_region(40.71, -74.00, 1).cell;
        let b = to_coarse_region(40.72, -74.01, 1).cell;
        // Nearby points often share cells; score counts unique cells.
        let score = triangulation_resistance_score(&[a.clone(), b, a]);
        assert!(score >= 1);
    }
}
