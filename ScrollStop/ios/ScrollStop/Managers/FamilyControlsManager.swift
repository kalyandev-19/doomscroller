import Foundation
import FamilyControls
import ManagedSettings
import DeviceActivity
import Combine

/**
 * FamilyControlsManager wraps Apple's Screen Time FamilyControls and ManagedSettings APIs.
 * It requests child/individual monitoring authorization and manages app group blocklists.
 */
@MainActor
class FamilyControlsManager: ObservableObject {
    static let shared = FamilyControlsManager()
    
    private let center = AuthorizationCenter.shared
    private let store = ManagedSettingsStore()
    
    @Published var isAuthorized = false
    @Published var selections = FamilyActivitySelection() {
        didSet {
            saveSelections()
        }
    }
    
    private init() {
        self.isAuthorized = (center.authorizationStatus == .approved)
        loadSelections()
    }
    
    /**
     * Request Screen Time Family Controls entitlement.
     * This requires approval from the user via face ID / passcode.
     */
    func requestAuthorization() async {
        do {
            try await center.requestAuthorization(for: .individual)
            self.isAuthorized = (center.authorizationStatus == .approved)
        } catch {
            print("Failed to authorize Screen Time API: \(error.localizedDescription)")
            self.isAuthorized = false
        }
    }
    
    /**
     * Applies restrictions using ManagedSettings.
     * Restricts application tokens stored in the FamilyActivitySelection.
     */
    func applyShields() {
        guard isAuthorized else { return }
        
        let applications = selections.applicationTokens
        let categories = selections.categoryTokens
        
        if applications.isEmpty && categories.isEmpty {
            store.shield.applications = nil
            print("Shields removed successfully.")
        } else {
            // Apply shields to target apps (e.g. Instagram & YouTube)
            store.shield.applications = applications
            print("Shields applied to selected applications.")
        }
    }
    
    /**
     * Clear all active shields.
     */
    func clearShields() {
        store.shield.applications = nil
    }
    
    // User Defaults state helpers
    private func saveSelections() {
        let encoder = JSONEncoder()
        if let encoded = try? encoder.encode(selections) {
            UserDefaults.standard.set(encoded, forKey: "ScrollStopSelections")
            applyShields()
        }
    }
    
    private func loadSelections() {
        if let data = UserDefaults.standard.data(forKey: "ScrollStopSelections") {
            let decoder = JSONDecoder()
            if let decoded = try? decoder.decode(FamilyActivitySelection.self, from: data) {
                self.selections = decoded
            }
        }
    }
}
