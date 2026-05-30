import SwiftUI

/**
 * Main application entry point for iOS ScrollStop app.
 * Switches between OnboardingView and SettingsView based on onboarding state.
 */
@main
struct ScrollStopApp: App {
    @AppStorage("onboardingComplete") private var onboardingComplete = false
    
    var body: some Scene {
        WindowGroup {
            if onboardingComplete {
                SettingsView()
                    .preferredColorScheme(.dark)
            } else {
                OnboardingView(onboardingComplete: $onboardingComplete)
                    .preferredColorScheme(.dark)
            }
        }
    }
}
