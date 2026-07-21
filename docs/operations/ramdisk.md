# RAM disk (macOS) for agent-speed workflows

## Reality check for this Mac

| Spec | Value |
|---|---|
| Machine | MacBook Pro (M3 Max) |
| Memory | **36 GB unified** (soldered — cannot install 64 GB DIMMs) |
| Disk free (Data) | often critically low (~7 GB observed) |
| Swap | already active under load |

The “install 64GB DDR5 + tmpfs” advice is a **Linux / upgradable desktop** pattern. On this Mac:

- There is **no Linux tmpfs**; we use an **APFS RAM disk** via `hdiutil`.
- A huge RAM disk on 36 GB will force **compressed memory + swap** and can make agents *slower*.
- Peak agent speed here comes from: free SSD space, modest RAM disk, and GitHub sync — not a 16–32 GB RAM volume.

Quoted “60 GB/s filesystem” numbers are peak memory bandwidth marketing, not what you will measure for Cargo/Swift file I/O.

## Recommended setup (this host)

Default RAM disk: **4 GiB** (safe on 36 GB).

```bash
make ramdisk-status
make ramdisk-up          # create + mirror project into /Volumes/SwipeDatingRAM/Swipe Dating
# Open Cursor / agents on that path
make ramdisk-sync-back   # copy edits to persistent disk
make ramdisk-down        # sync-back + destroy RAM volume
```

Optional larger disk (only if Activity Monitor shows plenty free memory):

```bash
RAMDISK_GB=6 make ramdisk-up
```

Include Cargo `target/` on the RAM volume (faster compiles, uses more RAM):

```bash
RAMDISK_INCLUDE_TARGET=1 RAMDISK_GB=8 make ramdisk-up
```

## Paths

| Role | Path |
|---|---|
| Persistent project | `/Users/computer/App Development/Swipe Dating` |
| RAM worktree | `/Volumes/SwipeDatingRAM/Swipe Dating` |
| State files | `~/.cache/swipe-dating-local/ramdisk/` |

## Agent workflow

1. `make sync` on the persistent tree (align with GitHub).
2. `make ramdisk-up`.
3. Point Cursor at `/Volumes/SwipeDatingRAM/Swipe Dating` (File → Open, or agent root move).
4. Code/test on the RAM worktree.
5. Periodically `make ramdisk-sync-back` and `make sync` so GitHub has commits.
6. `make ramdisk-down` when finished (syncs back by default).

**Power loss / sleep / eject without sync-back = lost uncommitted RAM work.** Commit early; sync often.

## Higher priority than a big RAM disk

1. Free SSD space (Data volume was ~100% full) — biggest latent slowdown.
2. Keep DerivedData / `target` pruned.
3. Use `make sync` so GPT/agents share GitHub as source of truth.
4. If you truly need 64 GB+ RAM disk headroom, that requires a **different machine** with more unified memory.

## Commands

```bash
./scripts/ramdisk.sh status
./scripts/ramdisk.sh up
./scripts/ramdisk.sh sync-back
./scripts/ramdisk.sh down
```
