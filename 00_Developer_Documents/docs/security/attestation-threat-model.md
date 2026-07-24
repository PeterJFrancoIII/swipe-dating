# Attestation Threat Model (Draft)

Attestation is a risk signal, not proof of good character.

Threats: emulator farms, replayed attestations, provider outages, false positives on legitimate devices.

Controls: short TTL risk tokens; appeal path; fail closed on ambiguity for new accounts; never sole source of truth for bans.
