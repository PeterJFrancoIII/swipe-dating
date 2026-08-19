# Get Fk'd 1-mile default and Bluetooth sonar

- **ID:** 2026-08-18-getfkd-proximity
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-18 18:40 ET — Get Fk'd should default to 1 mile and become hyper-sensitive in Bluetooth range: sonar ding when close, warmer vibration, more intense as you get closer.
- **Do not self-accept.**
- **GitHub:** https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-18-getfkd-proximity.md

## What

Entering Get Fk'd sets discovery to 1 mile. While the mode is on, the Getfkd iOS client advertises/scans an anonymous service UUID. RSSI drives sonar interval, ding pitch, and haptic warmth. No meters, direction, nearby count, or profile identity on the radio.

## Files

- `apps/swipe/lib/getfkdMode.ts`
- `apps/swipe/lib/getfkdMode.test.ts`
- `apps/swipe/lib/getfkdProximity.ts`
- `apps/swipe/lib/getfkdProximity.test.ts`
- `apps/swipe/lib/session.tsx`
- `apps/swipe/components/GetFkdProximityHost.tsx`
- `apps/swipe/app/(tabs)/_layout.tsx`
- `apps/swipe/app.json`
- `apps/swipe/package.json`
- `apps/swipe/modules/getfkd-location/**`
- this packet, `.agent-memory/CURRENT.md`

## Not in this slice

- BLE handshake / profile exchange / compatibility check before cue (ADR-0009 later)
- Background BLE
- Exact km, compass, or a people-nearby count
- HTML / golden master
- Live two-phone dogfood

## Validation

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tsc exit 0
# tests 65, pass 65, fail 0
```

## Ask of owner

Rebuild the Getfkd iOS development client so `startProximityBroadcast` is in the binary. Turn Get Fk'd on on two nearby phones. Expect the Distance filter to land on 1 mile, then sonar + warmer vibration that speeds up as the phones get closer. Expo Go will not play the native radio.
