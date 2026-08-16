export type LegalDoc = {
  slug: string;
  title: string;
  body: string;
};

export const LEGAL_DRAFT_BANNER =
  "Draft — not in force. Counsel has not approved this text. It is shown so you can read the intended rules before any public launch.";

export const OPERATOR_CONTACT = "peterjfrancoiii@icloud.com";

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    body: `Get fk'd is an adults-only (18+) dating app operated as a draft service by Peter Franco. Contact: ${OPERATOR_CONTACT}.

We do not sell dating, sexuality, location, message, or photo data for ads. We do not use that data to train advertising models. We do not show exact peer location, coordinates, or live distance.

What this build may hold to run the service:
• Account and session identifiers (a device session token bound to Sign in with Apple; no email/password)
• Apple user identifier (sub) after Sign in with Apple; email only if Apple shares it on first grant
• Adult-eligibility signals from Apple Declared Age Range (fail closed when 18+ cannot be established)
• Profile fields and photos you choose to show
• Likes, matches, limited chat, meetup plans, blocks, and reports you send
• A reduced-accuracy GPS sample long enough to verify it and replace it with a 1-mile randomized cell; peers see only a rounded mile band
• Coarse city/region labels you type

What we do not collect in this build:
• Precise GPS shared with other users
• Stored raw coordinates after the cell is saved
• Advertising identifiers for tracking
• Payment card data (there are no in-app purchases in this version)

How it is used: to show you other adults, create mutual matches, deliver messages, and handle block/report/delete. Retention is until you delete the account or the session expires. Export and delete are in Profile.

Children: no one under 18 may use Get fk'd. There is no parental-consent path. If we learn an account is under 18, it is removed.

Your intended rights (to be completed by counsel before a public launch): access, correction, deletion, and export. Use Profile → Export my data or Delete account, or email ${OPERATOR_CONTACT}.

Third parties: Apple may process Declared Age Range and Sign in with Apple on the device. Hosting for this draft API is on the operator's own equipment, reached over HTTPS. No analytics SDK is bundled in this client. The operator console does not show ordinary profiles, photos, or messages.

This text is a draft for review and App Store URL fields. It is not a counsel-approved policy.`,
  },
  {
    slug: "terms",
    title: "Terms of Service",
    body: `You must be 18 or older. There is no parental-consent path for minors.

You use Get fk'd at your own risk. We do not guarantee matches or safety outcomes. Follow Community Rules. We may suspend access for violations.

Block, report, age assurance, and the free daily swipe allotment are never paywalled.

This version does not sell Boosts, Superlikes, or any other digital item. There are no in-app purchases.

Operator contact for this draft: Peter Franco, ${OPERATOR_CONTACT}. Governing law and liability language are placeholders until counsel approves a public version.`,
  },
  {
    slug: "community",
    title: "Community Rules",
    body: `Adults only (18+). These rules are behavior-focused.

Consent: messaging starts after a mutual match. Stop after block, unmatch, or a clear do-not-contact. A match is not consent to sex, location, or intimate media.

Prohibited: anyone under 18; CSAM; grooming; trafficking; NCII; stalking; doxxing; exact-location disclosure; coercion; bots and mass scraping.

Report and block stay free. One report never auto-bans. Child-safety and NCII cases escalate to the operator at ${OPERATOR_CONTACT}.`,
  },
  {
    slug: "support",
    title: "Support",
    body: `In-app: Block / Report on any card or chat.

Account: Profile → Export my data or Delete account.

Operator email: ${OPERATOR_CONTACT}

This build is not a staffed 24/7 desk. For anyone who appears under 18, CSAM, or non-consensual intimate imagery, email ${OPERATOR_CONTACT} with the word URGENT in the subject. The operator will escalate. Public CyberTipline filing is a human action, not an automated in-app send.`,
  },
];

export function legalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((doc) => doc.slug === slug);
}
