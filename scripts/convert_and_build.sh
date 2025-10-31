#!/bin/bash
set -euo pipefail

# Inputs (configure in Codemagic Environment variables)
APP_NAME="${APP_NAME:-No Google Sign-In Prompt}"
BUNDLE_ID="${BUNDLE_ID:?Set BUNDLE_ID in environment, e.g. com.yourname.NoSignInPrompt}"
TEAM_ID="${TEAM_ID:?Set TEAM_ID (Apple Developer Team ID) in environment}"
EXPORT_METHOD="${EXPORT_METHOD:-app-store}" # or 'development' for local testing

ROOT_DIR="$(pwd)"
EXT_DIR="${ROOT_DIR}/extension"
BUILD_DIR="${ROOT_DIR}/build"

echo "==> Cleaning build dir"
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

echo "==> Converting Web Extension to Xcode project (iOS target)"
xcrun safari-web-extension-converter "${EXT_DIR}" \
  --app-name "${APP_NAME}" \
  --bundle-identifier "${BUNDLE_ID}" \
  --project-location "${BUILD_DIR}" \
  --ios --no-open --force

PROJ_DIR="${BUILD_DIR}/${APP_NAME}"
WORKSPACE_PATH="${PROJ_DIR}/${APP_NAME}.xcworkspace"

if [ ! -d "${WORKSPACE_PATH}" ]; then
  # Fallback to xcodeproj if workspace not generated
  PROJ_PATH="${PROJ_DIR}/${APP_NAME}.xcodeproj"
  if [ ! -d "${PROJ_PATH}" ]; then
    echo "Xcode project not found after conversion."
    exit 1
  fi
fi

SCHEME="${APP_NAME} (iOS)"
ARCHIVE_PATH="${BUILD_DIR}/${APP_NAME}.xcarchive"
EXPORT_PATH="${BUILD_DIR}/export"

echo "==> Archiving with xcodebuild"
xcodebuild -scheme "${SCHEME}" \
  -workspace "${WORKSPACE_PATH}" \
  -configuration Release \
  -archivePath "${ARCHIVE_PATH}" \
  DEVELOPMENT_TEAM="${TEAM_ID}" \
  PRODUCT_BUNDLE_IDENTIFIER="${BUNDLE_ID}" \
  clean archive | xcpretty

echo "==> Creating export options"
cat > "${BUILD_DIR}/ExportOptions.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>${EXPORT_METHOD}</string>
  <key>compileBitcode</key><false/>
  <key>destination</key><string>export</string>
  <key>signingStyle</key><string>automatic</string>
  <key>stripSwiftSymbols</key><true/>
</dict>
</plist>
EOF

echo "==> Exporting IPA"
mkdir -p "${EXPORT_PATH}"
xcodebuild -exportArchive \
  -archivePath "${ARCHIVE_PATH}" \
  -exportPath "${EXPORT_PATH}" \
  -exportOptionsPlist "${BUILD_DIR}/ExportOptions.plist" | xcpretty

echo "==> Done. IPA located at ${EXPORT_PATH}"
