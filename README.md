# No Google Sign-In Prompt (iOS Safari Web Extension)

This repo contains a **Safari Web Extension** that hides Google One Tap / “Sign in with Google” prompts.
You can build and ship it to **TestFlight / App Store** using **Codemagic** (no local Xcode needed).

## What’s inside
- `extension/` — WebExtension (Manifest V3) sources
- `scripts/convert_and_build.sh` — CI script that uses Apple's tool to convert the web extension into an iOS app and build it
- `codemagic.yaml` — Codemagic workflow to build and upload to TestFlight
- `privacy-policy.md` — A simple privacy policy (no data collection)

## Quick start (like you’re 5 👶)

1. **Make an Apple Developer account** and enroll ($99/year).
2. **Create App Store Connect app** with a bundle ID (e.g., `com.yourname.NoSignInPrompt`).
3. **Fork/clone this repo to your GitHub** and **edit `codemagic.yaml`**: set your real `BUNDLE_ID`.
4. **Create a Codemagic account** and connect your GitHub repo.
5. In Codemagic:
   - Create a **group** named `appstore_credentials` with:
     - `APP_STORE_CONNECT_KEY` — contents of your App Store Connect API key (.p8)
     - `APP_STORE_CONNECT_ISSUER_ID` — issuer ID
     - `APP_STORE_CONNECT_KEY_IDENTIFIER` — key ID
   - Create a **group** named `apple_signing` with:
     - `APPLE_TEAM_ID` — your Apple Developer Team ID
     - (Optional) add code signing certs if not using automatic signing
6. **Run the `ios_safari_webext` workflow.** It will:
   - Convert the web extension into an iOS Xcode project (using Apple's converter)
   - Build a Release archive
   - Export an `.ipa`
   - Upload to **TestFlight** automatically

7. In **App Store Connect**:
   - Add screenshots (use iPhone/iPad)
   - Set **Pricing** to **Tier 1 ($0.99 USD)**
   - Fill in the privacy policy URL and app description
   - Submit for review

## Allowlist
Open the extension popup/options and add domains (like `example.com`) where you **want** the Google prompt to appear.

## Notes
- Requires iOS 15+ (Safari Web Extensions support). 
- No analytics, no tracking, nothing leaves the device.

MIT License © 2025


## App Store text you can paste

**Subtitle**: Block Google One-Tap and “Sign in with Google” overlays  
**Keywords**: safari, extension, content blocker, google, one tap, privacy  
**Promotional text**: Hide “Sign in with Google” prompts. Keep browsing clean. No data collected.

**Description**  
No Google Sign-In Prompt blocks Google One-Tap / “Sign in with Google” overlays in Safari on iPhone and iPad.  
- Removes the Google Identity Service (GIS) iframes and containers
- Works automatically on every site
- Add sites to an allowlist where you *do* want the prompt
- 100% on-device. No tracking. No analytics.

**Disclaimer**  
This app is an independent utility and is **not affiliated with or endorsed by Google LLC**.

