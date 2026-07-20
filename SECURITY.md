# Security Policy

## Reporting a vulnerability

Email: `CHANGE_ME` (configure before public disclosure process goes live)

Please include:

- affected component and version/commit;
- reproduction steps;
- impact assessment;
- whether exploitation is known in the wild.

Do **not** attach real user content, intimate images, identity documents, child-safety evidence, or production secrets to the security mailbox. Use the product safety-reporting channel (when available) for abuse involving user content, and law-enforcement / NCMEC processes owned by humans for child-safety material.

We aim to acknowledge reports within 5 business days once the mailbox is staffed. This is a staging project; response SLAs are not yet operational commitments.

## Scope notes

- Autonomous agents must not send NCMEC CyberTipline reports, law-enforcement disclosures, or user notifications.
- Production secrets must never be committed.
- Security fixes for crypto, identity, age, location, and report pipelines require CODEOWNERS review.
- Release and production remain human-gated: `docs/governance/release-gates.md`.
- Child-safety and NCII baselines: `docs/governance/child-safety-baseline.md`, `docs/governance/ncii-takedown-baseline.md`.

## Related

- Threat model: `docs/security/threat-model.md` (when present)
- Safety playbooks: `docs/safety/`
