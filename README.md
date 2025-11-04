# SignInPromptBlocker

Blocks Google One Tap / “Sign in with Google” prompts in Safari. Optional **Smart Redirects** to open Google Maps links in Apple Maps (OFF by default).

## 🧰 What’s inside
- `extension/` – WebExtension (MV3) code (allowlist + GIS removal + Smart Redirects toggle)
- `.github/workflows/ios.yml` – GitHub Actions workflow to build & upload to TestFlight
- `fastlane/Fastfile` – signing/build/upload automation

---

# 🍏 Apple setup (everything you need to do)

## 1) Join Apple Developer Program
- Enroll with your Apple ID (paid membership).

## 2) Create the App in App Store Connect
- My Apps → **+ → New App**
- Name: **SignInPromptBlocker**
- Platform: **iOS**
- Bundle ID: **com.wildcorelabs.SignInPromptBlocker**
- SKU: any unique string (e.g., `sipb001`)

## 3) Create an App Store Connect API key (for CI upload)
- App Store Connect → **Users and Access → Keys (tab) → +**
- Name: `GitHub Actions Upload Key`
- Role: **App Manager** or **Admin**
- Download the `.p8` file (only once)
- Note the **Issuer ID** and **Key ID**

## 4) Create signing certs & profiles with Fastlane match (one-time)
On your Mac:
```bash
gem install fastlane --no-document
fastlane match appstore --readonly false
```
- Create/choose a **private Git repo** to store certs/profiles (encrypted).
- Pick a **MATCH_PASSWORD** (remember it).
- Ensure a profile exists for **com.wildcorelabs.SignInPromptBlocker**.

## 5) Add GitHub Secrets (Repo → Settings → Secrets and variables → Actions)
**App Store Connect:**
- `APP_STORE_CONNECT_ISSUER_ID`
- `APP_STORE_CONNECT_KEY_IDENTIFIER`
- `APP_STORE_CONNECT_KEY` (paste the entire `.p8` contents)

**Fastlane match:**
- `MATCH_GIT_URL`
- `MATCH_PASSWORD`
- `MATCH_GIT_BASIC_AUTHORIZATION` (optional for HTTPS)

**Team/App:**
- `APPLE_TEAM_ID`

## 6) Run the workflow
- Push to `main` (or use **Actions → Run workflow**)
- The job will:
  1) Convert `extension/` → Xcode project
  2) Fetch signing from **match**
  3) Build and export the `.ipa`
  4) Upload to **TestFlight**
- You’ll also get the `.ipa` under **Artifacts**.

---

# 🛠 Local device test (optional)
```bash
cd extension
xcrun safari-web-extension-converter . --ios
# Open in Xcode, select Team, run on your iPhone
```

---

# 🧾 App Store checklist
- **Pricing**: Tier 1 ($0.99 USD)
- **Category**: Utilities
- **App Icon**: 1024×1024 PNG (no alpha)
- **Screenshots**: iPhone + iPad (Extensions toggle, Options page)
- **Privacy Policy URL**: publish `privacy-policy.md`
- **App Privacy**: No Data Collected
- **Export Compliance**: Yes (Apple libraries only)
- **Disclaimer**: “This app is not affiliated with or endorsed by Google LLC.”

---

# 📱 How users enable it
1) Install from TestFlight/App Store
2) Settings → Safari → Extensions → **SignInPromptBlocker** → ON → Allow on All Websites
3) (Optional) Options → enable **Smart Redirects** (Google Maps → Apple Maps)

---

MIT License © 2025
