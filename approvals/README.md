# Human release approvals

Production and any real-user beta require authentic, dated, named human approvals. Autonomous agents must not author, sign, backdate, copy, or mark these artifacts approved.

## Required production roles

| File role | Human owner / evidence | Maximum freshness |
|---|---|---|
| `legal` | Counsel sign-off on terms, age, child safety, NCII, proximity/location, sexual modes, marketplace | 90 days |
| `privacy` | DPIA and privacy/data-rights acceptance | 90 days |
| `security` | Independent security/cryptographic review and blocker disposition | 180 days |
| `trust-safety` | Staffing, P0 coverage, moderation, appeals, evidence operations | 30 days |
| `executive` | Exact launch scope, markets, cohort, risk acceptance | 30 days |
| `mobile` | Current Apple/Google compliance matrices and build artifacts | 30 days |
| `infra` | Production account, region, keys, backup, network, and deployment attestation | 7 days |
| `child-safety` | Public CSAE standards, contact, escalation, and legal reporting process | 30 days |
| `ncii` | Victim/non-user intake and time-bound removal operation | 30 days |
| `proximity` | BLE privacy/stalking/battery review and red-team acceptance | 30 days |
| `location` | Location DPIA, E2EE/revocation and coercion/stalking acceptance | 30 days |
| `anti-abuse` | Attestation, fraud, quotas, false-positive, appeal, and kill-switch acceptance | 30 days |
| `marketplace` | Asset security, moderation, copyright, billing, finance, and creator operations | 30 days |

A beta pack may use a separately protected workflow and narrower scope, but it must still bind approvals to the exact beta commit/artifacts and satisfy every applicable gate in `docs/governance/release-gates.md`.

## File format

Use one or more files named:

```text
<role>-<YYYY-MM-DD>-<short-description>.approval.json
```

Example schema:

```json
{
  "schema_version": 1,
  "role": "security",
  "status": "APPROVED",
  "scope": "production release",
  "approved_by": "Named Human",
  "approver_organization": "Independent Security Firm",
  "approved_at_utc": "2026-07-21T14:30:00Z",
  "expires_at_utc": "2027-01-17T14:30:00Z",
  "commit_sha": "0123456789abcdef0123456789abcdef01234567",
  "artifact_sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "evidence_uri": "human-controlled evidence reference",
  "limitations": ["No unresolved critical findings"],
  "signature": {
    "type": "HUMAN_WORKFLOW_PLACEHOLDER",
    "verification_reference": "CHANGE_ME_IN_REAL_WORKFLOW"
  }
}
```

The example above is **not an approval**. Real workflows must replace the signature placeholder with a protected, human-verifiable signature or approval-system reference.

## Validator behavior

`scripts/production_preflight.sh` checks:

- every required role has at least one valid `.approval.json` file;
- JSON parses and `schema_version` is supported;
- `status` is exactly `APPROVED`;
- `role` matches the filename role;
- approver and organization are non-placeholder values;
- `approved_at_utc` and `expires_at_utc` parse and are current;
- `commit_sha` matches the exact release commit;
- `artifact_sha256` is a 64-character lowercase/uppercase hexadecimal digest;
- evidence and signature verification references are non-placeholder values.

Passing this mechanical validator does **not** prove authenticity. Protected branch rules and named humans must still verify the signatures, scope, evidence, conflicts, and release artifacts.

## Write controls

- Place approval files only through the protected human workflow.
- Never commit raw identity documents, intimate media, child-safety evidence, production secrets, private legal advice, or unrestricted evidence-vault exports.
- Do not amend an approval file after signing. Revoke it and create a new artifact.
- Keep reviewer and deployment permissions separated.
- Agents may report missing/invalid approvals but may not repair them by inventing values.
