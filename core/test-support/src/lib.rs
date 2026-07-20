//! Deterministic test utilities for the dating platform workspace.

use std::sync::atomic::{AtomicI64, Ordering};

/// Injectable wall clock for tests (unix seconds).
#[derive(Debug, Default)]
pub struct TestClock {
    unix_secs: AtomicI64,
}

impl TestClock {
    pub fn new(unix_secs: i64) -> Self {
        Self {
            unix_secs: AtomicI64::new(unix_secs),
        }
    }

    pub fn now_unix(&self) -> i64 {
        self.unix_secs.load(Ordering::SeqCst)
    }

    pub fn set(&self, unix_secs: i64) {
        self.unix_secs.store(unix_secs, Ordering::SeqCst);
    }

    pub fn advance(&self, delta_secs: i64) {
        self.unix_secs.fetch_add(delta_secs, Ordering::SeqCst);
    }
}

/// Deterministic RNG for reproducible tests.
#[derive(Debug, Clone)]
pub struct FakeRng {
    state: u64,
}

impl FakeRng {
    pub fn new(seed: u64) -> Self {
        Self { state: seed }
    }

    /// Returns the next pseudo-random `u64`.
    pub fn next_u64(&mut self) -> u64 {
        // xorshift64*
        let mut x = self.state;
        x ^= x >> 12;
        x ^= x << 25;
        x ^= x >> 27;
        self.state = x;
        x.wrapping_mul(0x2545_f991_4f6c_f7d1)
    }

    pub fn fill_bytes(&mut self, dest: &mut [u8]) {
        for chunk in dest.chunks_mut(8) {
            let val = self.next_u64();
            let bytes = val.to_le_bytes();
            let len = chunk.len();
            chunk.copy_from_slice(&bytes[..len]);
        }
    }
}

impl rand_core::RngCore for FakeRng {
    fn next_u32(&mut self) -> u32 {
        (self.next_u64() >> 32) as u32
    }

    fn next_u64(&mut self) -> u64 {
        self.next_u64()
    }

    fn fill_bytes(&mut self, dest: &mut [u8]) {
        FakeRng::fill_bytes(self, dest);
    }

    fn try_fill_bytes(&mut self, dest: &mut [u8]) -> Result<(), rand_core::Error> {
        self.fill_bytes(dest);
        Ok(())
    }
}

impl rand_core::CryptoRng for FakeRng {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clock_advances() {
        let clock = TestClock::new(1_000);
        assert_eq!(clock.now_unix(), 1_000);
        clock.advance(30);
        assert_eq!(clock.now_unix(), 1_030);
    }

    #[test]
    fn fake_rng_is_deterministic() {
        let mut a = FakeRng::new(42);
        let mut b = FakeRng::new(42);
        assert_eq!(a.next_u64(), b.next_u64());
    }
}
