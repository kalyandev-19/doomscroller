import DeviceActivity
import ManagedSettings
import Foundation

/**
 * DeviceActivityMonitor extension intercepts Screen Time thresholds and events.
 * It runs as a system daemon that survives force-quitting the main application.
 */
class DeviceActivityMonitor: DeviceActivityMonitorExtension {
    
    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        print("Monitoring window started for: \(activity.rawValue)")
    }
    
    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        // Clean up or reset shields when the monitoring window expires (e.g., at midnight)
        let store = ManagedSettingsStore()
        store.shield.applications = nil
        print("Monitoring window ended. Shields released.")
    }
    
    /**
     * Triggered automatically by the iOS system when the user reaches their daily Screen Time threshold.
     */
    override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        super.eventDidReachThreshold(event, activity: activity)
        
        print("Threshold event hit: \(event.rawValue) inside activity \(activity.rawValue)")
        
        // Block the apps specified in the selections
        let store = ManagedSettingsStore()
        
        // Retrieve selections saved in shared app group defaults
        if let sharedDefaults = UserDefaults(suiteName: "group.com.scrollstop.shared") {
            if let data = sharedDefaults.data(forKey: "ScrollStopSelections") {
                let decoder = JSONDecoder()
                if let selections = try? decoder.decode(FamilyActivitySelection.self, from: data) {
                    store.shield.applications = selections.applicationTokens
                    print("Shield applied securely from system background daemon.")
                }
            }
        }
    }
}
// Structure matching JSON representation of selection tokens for decoding outside the main target
private struct FamilyActivitySelection: Codable {
    var applicationTokens: Set<ApplicationToken>
    
    // Custom coding keys if needed for compatibility
    enum CodingKeys: String, CodingKey {
        case applicationTokens
    }
}
