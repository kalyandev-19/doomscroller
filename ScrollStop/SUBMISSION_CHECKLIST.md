# Play Store & App Store Submission Checklist - ScrollStop

ScrollStop utilizes powerful, low-level system APIs to intercept and block addictive feeds:
- **Android:** Accessibility Services (`AccessibilityService`) and System Overlay Window (`SYSTEM_ALERT_WINDOW`).
- **iOS:** Screen Time API (`FamilyControls` & `ManagedSettings`).

Because of the sensitive nature of these APIs, both Google and Apple enforce strict review criteria. Follow this checklist to ensure successful app store approvals.

---

## 🤖 Google Play Store Submission Checklist

Google restricts the use of Accessibility Services to features that are critical to the app's core purpose. Self-regulation and screen limits are valid use cases, but they require strict compliance with Google's **User Data and Prominent Disclosure** policy.

### 1. In-App Prominent Disclosure (Mandatory)
Before requesting the Accessibility Service permission in your onboarding flow, you must display a prominent disclosure that explains:
- [ ] Exactly **why** the app needs this permission (e.g., "to detect when Instagram Reels or YouTube Shorts are actively playing").
- [ ] Exactly **how** it is used (e.g., "to count each video scrolled past to track your daily limit").
- [ ] Clear statement that **no data is collected, stored, or transmitted** off the device.
- [ ] User must explicitly click an "Accept" or "Enable Service" button (cannot be automated or pre-checked).

### 2. Play Console Declaration Form
When uploading your app bundle (.aab), you must complete the Accessibility Declaration:
- [ ] Select **Screen Time/Self-Regulation** as the primary category.
- [ ] Submit a **short video walkthrough** showing the user entering the app, seeing the disclosure, enabling accessibility in settings, and experiencing the block screen. (Provide a YouTube/Vimeo link).

### 3. Safety & Privacy Compliance
- [ ] Ensure the app does not intercept sensitive inputs (passwords, payment fields).
- [ ] Maintain a host privacy policy URL that clearly outlines that the Accessibility Service is executed locally on-device.

---

## 🍏 Apple App Store Submission Checklist

The Screen Time API requires the **Family Controls Entitlement** from Apple. If you build the app without this entitlement, it will compile locally for simulator testing but fail when submitting to TestFlight or App Store Connect.

### 1. Family Controls Entitlement Request
You must submit a request form to Apple detailing your app's use case:
- [ ] Go to [developer.apple.com/contact/request/family-controls-entitlement](https://developer.apple.com/contact/request/family-controls-entitlement)
- [ ] Explain that your app targets **Self-Regulation and Focus** for adults or kids.
- [ ] Clearly state that you use `FamilyControls` and `ManagedSettings` to shield distracting categories/apps (Instagram, YouTube) once daily user-defined scroll limits are met.

### 2. App Store Review Guideline Compliance
- **Guideline 2.5.4 (Multitasking & System Customization):** 
  - [ ] Ensure your Shield Extensions do not attempt to modify system elements outside of the permitted Shield Configuration APIs.
  - [ ] Hiding the secondary button (leaving only "Close App") is compliant as long as the user selected this limit option themselves.
- **Guideline 5.1.1 (Privacy):**
  - [ ] Screen Time applications must not share usage statistics with third parties.
  - [ ] All analytics data must remain local or strictly anonymized.

### 3. App Store Connect Setup
- [ ] Verify that your App ID includes the **Family Controls (Screen Time)** capability in the Apple Developer Portal.
- [ ] Configure provisioning profiles to include the `com.apple.developer.family-controls` entitlement key.
