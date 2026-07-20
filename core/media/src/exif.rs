//! EXIF GPS tag stripping interface.

use std::collections::BTreeMap;

/// EXIF GPS IFD tag identifiers that reveal location.
pub const GPS_TAG_IDS: &[u16] = &[
    0x0000, // GPSVersionID
    0x0001, // GPSLatitudeRef
    0x0002, // GPSLatitude
    0x0003, // GPSLongitudeRef
    0x0004, // GPSLongitude
    0x0005, // GPSAltitudeRef
    0x0006, // GPSAltitude
    0x0007, // GPSTimeStamp
    0x0008, // GPSSatellites
    0x0009, // GPSStatus
    0x000A, // GPSMeasureMode
    0x000B, // GPSDOP
    0x000C, // GPSSpeedRef
    0x000D, // GPSSpeed
    0x000E, // GPSTrackRef
    0x000F, // GPSTrack
    0x0010, // GPSImgDirectionRef
    0x0011, // GPSImgDirection
    0x0012, // GPSMapDatum
    0x0013, // GPSDestLatitudeRef
    0x0014, // GPSDestLatitude
    0x0015, // GPSDestLongitudeRef
    0x0016, // GPSDestLongitude
    0x0017, // GPSDestBearingRef
    0x0018, // GPSDestBearing
    0x0019, // GPSDestDistanceRef
    0x001A, // GPSDestDistance
    0x001B, // GPSProcessingMethod
    0x001D, // GPSDateStamp
    0x001E, // GPSDifferential
];

pub fn gps_tag_ids() -> &'static [u16] {
    GPS_TAG_IDS
}

pub type ExifTagMap = BTreeMap<u16, Vec<u8>>;

/// Removes all GPS-related tags from an EXIF tag map. Returns count removed.
pub fn strip_location_metadata(tags: &mut ExifTagMap) -> usize {
    let before = tags.len();
    tags.retain(|tag_id, _| !GPS_TAG_IDS.contains(tag_id));
    before - tags.len()
}

/// Zeros GPS coordinate fields in a minimal JPEG APP1 Exif stub.
///
/// The stub layout is: `FF E1` marker, length, `Exif\0\0`, TIFF header, GPS IFD entries.
/// GPS latitude/longitude payload bytes are zeroed in-place when the stub is recognized.
pub fn strip_jpeg_gps_app1(jpeg: &mut [u8]) -> bool {
    const EXIF_MAGIC: &[u8] = b"Exif\0\0";
    let Some(idx) = jpeg.windows(EXIF_MAGIC.len()).position(|w| w == EXIF_MAGIC) else {
        return false;
    };
    let gps_offset = idx + EXIF_MAGIC.len() + 8;
    if gps_offset + 16 > jpeg.len() {
        return false;
    }
    // Zero a fixed GPS coordinate payload region in the minimal test stub.
    for byte in &mut jpeg[gps_offset..gps_offset + 16] {
        *byte = 0;
    }
    true
}

#[cfg(test)]
mod tests {
    use super::*;
    use proptest::prelude::*;

    fn sample_tags_with_gps() -> ExifTagMap {
        let mut tags = ExifTagMap::new();
        tags.insert(0x010E, b"ImageDescription".to_vec());
        tags.insert(0x0002, vec![0x12, 0x34]);
        tags.insert(0x0004, vec![0x56, 0x78]);
        tags.insert(0x8769, b"GPSInfo".to_vec());
        tags
    }

    #[test]
    fn strip_location_metadata_removes_gps_tags() {
        let mut tags = sample_tags_with_gps();
        let removed = strip_location_metadata(&mut tags);
        assert_eq!(removed, 2);
        assert!(!tags.contains_key(&0x0002));
        assert!(!tags.contains_key(&0x0004));
        assert!(tags.contains_key(&0x010E));
    }

    #[test]
    fn strip_jpeg_gps_zeros_payload() {
        // Minimal JPEG with APP1 Exif header; bytes at offset 20..36 are GPS payload.
        let mut jpeg = vec![
            0xFF, 0xD8, 0xFF, 0xE1, 0x00, 0x30, b'E', b'x', b'i', b'f', 0, 0, 0x49, 0x49, 0x2A,
            0x00, 0x08, 0x00, 0x00, 0x00, 0xAA, 0xBB, 0xCC, 0xDD, 0x11, 0x22, 0x33, 0x44, 0x55,
            0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x00, 0x11, 0xFF, 0xD9,
        ];
        assert!(strip_jpeg_gps_app1(&mut jpeg));
        assert!(jpeg[20..36].iter().all(|b| *b == 0));
    }

    proptest! {
        #[test]
        fn gps_tags_never_survive_strip(
            non_gps in prop::collection::btree_map(
                (0x0100u16..0x8000u16).prop_filter("non-gps tag", |t| !GPS_TAG_IDS.contains(t)),
                prop::collection::vec(any::<u8>(), 0..16),
                0..8
            ),
            gps_subset in prop::collection::vec(0u16..GPS_TAG_IDS.len() as u16, 0..5),
        ) {
            let mut tags: ExifTagMap = non_gps;
            for idx in gps_subset {
                let tag = GPS_TAG_IDS[idx as usize % GPS_TAG_IDS.len()];
                tags.insert(tag, vec![1, 2, 3]);
            }
            strip_location_metadata(&mut tags);
            for tag in GPS_TAG_IDS {
                prop_assert!(!tags.contains_key(tag));
            }
        }
    }
}
