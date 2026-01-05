# Distribution

Once your app is ready, you will package and distribute it so users can install and run it. 

Tauri supports producing platform-native bundles and installers; this document gives a concise overview of the concepts and pointers to the official Tauri documentation for platform-specific details.

## Building for Production

Use the Tauri build command to produce production bundles for one or more targets:

```bash
# Build all configured bundles
turbo tauri -- build
```

Build artifacts are produced under `src-tauri/target/release/bundle/` and typically include platform-appropriate formats. Configure what gets produced in your `tauri.conf.json` bundle section.

- macOS: `.dmg`, `.app`
- Windows: `.msi`, `.exe`
- Linux: `.deb`, `.rpm`, `.AppImage`

A minimal `bundle` configuration may look like:

```json
{
  "bundle": {
    "active": true,
    "targets": "all",
    "identifier": "com.yourcompany.yourapp"
  }
}
```

For full configuration options, see the Tauri distribution configuration docs.

## Code Signing

Code signing is the process of cryptographically signing your app binaries and installers so platforms and users can verify the publisher and integrity of the software.

The goal is to establish publisher identity, enable notarization on macOS, and reduce warnings (e.g., Windows SmartScreen).

- macOS: typically requires an Apple Developer account and notarization for broad distribution.
- Windows: uses a code signing certificate from a trusted CA (or platform-specific signing services).
- Linux: signing is less centralized; some package formats or distribution channels support signatures for verification.

This guide does not cover step-by-step signing commands or environment configuration.

For platform-specific signing steps, certificates, and notarization details, follow the [Tauri signing guides](https://v2.tauri.app/distribute/sign/macos/).

## Automatic Updates

Automatic updates let your app check for, download, and apply new versions without users manually reinstalling.

An update manifest or endpoint advertises the latest version, the updater checks that endpoint and verifies update integrity (signatures), then downloads and installs updates.

Tauri provides an [updater plugin](https://v2.tauri.app/plugin/updater/) and patterns for hosting update metadata and artifacts.

## App Stores

If you plan to publish to platform app stores, be aware of their extra requirements:

- macOS App Store: App Sandbox, entitlements, and App Store-specific packaging.
- Microsoft Store: MSIX packaging and Partner Center submission.
- Linux stores (Flathub, Snap Store, etc.): packaging formats and store submission processes differ.

Check the [Tauri app stores](https://v2.tauri.app/distribute/) documentation and the target store's guidelines for the precise steps and policies.

## CI / CD

We will provide a GitHub Action workflow to automate the bundling process for all targets (it's a work in progress). When available, it will be explained here.

## Learn More

For full, authoritative, and up-to-date instructions — including commands, certificates, keys, and security guidance — see the Tauri documentation:

- [Tauri Distribution Overview](https://v2.tauri.app/distribute/)
- [Tauri Signing Guides](https://v2.tauri.app/distribute/sign/)
- [Tauri Updater Plugin](https://v2.tauri.app/plugin/updater/)
- [Tauri GitHub Action](https://github.com/tauri-apps/tauri-action)
