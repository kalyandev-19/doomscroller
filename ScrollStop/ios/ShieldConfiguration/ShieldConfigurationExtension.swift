import ManagedSettings
import ManagedSettingsUI
import UIKit

/**
 * ShieldConfigurationExtension customizes the appearance of the native iOS full-screen blocker.
 * Returning custom text, colors, and layout configurations.
 */
class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    
    override func configuration(shielding application: Application) -> ShieldConfiguration {
        // Customize shield settings to prevent bypass options
        return ShieldConfiguration(
            backgroundEffect: UIBlurEffect(style: .dark),
            backgroundColor: UIColor(red: 0.04, green: 0.04, blue: 0.06, alpha: 1.0), // Deep slate background
            icon: UIImage(systemName: "hourglass.badge.plus"),
            title: ShieldConfiguration.Label(
                text: "Time to Step Away",
                color: .white
            ),
            subtitle: ShieldConfiguration.Label(
                text: "You have reached your daily Instagram Reels / YouTube Shorts limit. Breathe and reconnect with the real world.",
                color: UIColor(red: 0.63, green: 0.65, blue: 0.75, alpha: 1.0)
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "Close App",
                color: .black
            ),
            primaryButtonBackgroundColor: UIColor(red: 0.0, green: 0.7, blue: 0.85, alpha: 1.0), // Teal accent
            
            // Setting secondaryButtonLabel to nil removes the default "Ask for More Time" bypass button
            secondaryButtonLabel: nil
        )
    }
    
    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        return configuration(shielding: application)
    }
}
