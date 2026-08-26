# App Store Connect upload pack

**Updated:** 2026-08-20  
**Status:** Human upload only. Agent does not submit.

Put these into App Store Connect for **Getfkd** (`app.getfkd.ios`). Upload **store IPA 12** only (`713f97cc-bc96-4ddd-9a25-c4b9a3d98955`).

## Folder

| File | Where it goes in Connect |
|---|---|
| `01-listing-fields.txt` | App Information / version metadata |
| `02-promotional-text.txt` | Promotional Text (170) |
| `03-description.txt` | Description |
| `04-keywords.txt` | Keywords (100) |
| `05-privacy-nutrition.txt` | App Privacy nutrition labels |
| `06-age-rating-17-plus.txt` | Age Rating questionnaire |
| `07-review-notes.txt` | Notes for Review |
| `08-urls.txt` | Privacy Policy + Support URLs |
| `screenshots/ios-6.7/01-age-gate.png` | iPhone 6.7" (1290 × 2796) — Age gate |
| `screenshots/ios-6.7/02-swipe.png` | iPhone 6.7" — Swipe (synthetic Riley) |
| `screenshots/ios-6.7/03-matches.png` | iPhone 6.7" — Matches (synthetic Alex) |
| `screenshots/ios-6.7/04-chat.png` | iPhone 6.7" — Chat |
| `screenshots/ios-6.7/05-profile.png` | iPhone 6.7" — Profile |

## You still click

1. Create the iOS app if needed.
2. Paste the text files.
3. Upload the 6.7" PNGs.
4. `eas submit --platform ios --id 713f97cc-bc96-4ddd-9a25-c4b9a3d98955`
5. **Submit for Review**.
