import SwiftUI
import Charts
import FamilyControls

struct ScrollStat: Identifiable {
    let id = UUID()
    let day: String
    let count: Int
}

/**
 * SettingsView renders the primary ScrollStop control panel:
 * Displays weekly usage analytics with Swift Charts, platform toggles, and limit adjustment dialogs.
 */
struct SettingsView: View {
    @ObservedObject var manager = FamilyControlsManager.shared
    
    @State private var dailyLimit: Int = 15
    @State private var showLimitModal = false
    @State private var showPinModal = false
    @State private var newLimitValue = 15.0
    @State private var newPIN = ""
    
    // Mock Statistics telemetry data
    let weeklyStats: [ScrollStat] = [
        ScrollStat(day: "Sun", count: 8),
        ScrollStat(day: "Mon", count: 14),
        ScrollStat(day: "Tue", count: 18),
        ScrollStat(day: "Wed", count: 5),
        ScrollStat(day: "Thu", count: 22),
        ScrollStat(day: "Fri", count: 11),
        ScrollStat(day: "Sat", count: 12) // Today
    ]
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(red: 0.04, green: 0.04, blue: 0.06)
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        
                        // MARK: - Swift Charts Card
                        VStack(alignment: .leading, spacing: 16) {
                            HStack {
                                Text("Weekly Scroll History")
                                    .font(.system(size: 16, weight: .bold))
                                    .foregroundColor(.white)
                                Spacer()
                                Text("Last 7 Days")
                                    .font(.system(size: 12))
                                    .foregroundColor(.gray)
                            }
                            
                            // Swift Charts representation
                            Chart {
                                ForEach(weeklyStats) { stat in
                                    BarMark(
                                        x: .value("Day", stat.day),
                                        y: .value("Reels", stat.count)
                                    )
                                    // Highlight in orange if daily scroll limit was exceeded
                                    .foregroundStyle(stat.count >= dailyLimit ? Color.orange.gradient : Color.blue.gradient)
                                    .cornerRadius(6)
                                }
                                
                                // Render horizontal guide line indicating active daily scroll limit
                                RuleMark(
                                    y: .value("Limit", dailyLimit)
                                )
                                .lineStyle(StrokeStyle(lineWidth: 1.5, dash: [4, 4]))
                                .foregroundStyle(.orange)
                                .annotation(position: .trailing, alignment: .leading) {
                                    Text("Limit")
                                        .font(.system(size: 8, weight: .bold))
                                        .foregroundColor(.orange)
                                        .padding(.horizontal, 4)
                                }
                            }
                            .frame(height: 140)
                            
                            HStack {
                                Spacer()
                                Text("Today: 12 / \(dailyLimit) Reels watched")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.gray)
                                Spacer()
                            }
                            .padding(.top, 4)
                        }
                        .padding(20)
                        .background(Color(red: 0.1, green: 0.1, blue: 0.14))
                        .cornerRadius(20)
                        .padding(.horizontal, 20)
                        
                        // MARK: - Configurations List
                        VStack(alignment: .leading, spacing: 12) {
                            Text("CONFIGURATIONS")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(.gray)
                                .padding(.horizontal, 28)
                            
                            VStack(spacing: 1) {
                                // Scroll Limit Row
                                Button(action: {
                                    newLimitValue = Double(dailyLimit)
                                    showLimitModal = true
                                }) {
                                    HStack {
                                        Image(systemName: "slider.horizontal.3")
                                            .foregroundColor(.blue)
                                        Text("Daily Scroll Limit")
                                            .foregroundColor(.white)
                                        Spacer()
                                        Text("\(dailyLimit) Reels")
                                            .foregroundColor(.gray)
                                        Image(systemName: "chevron.right")
                                            .font(.caption)
                                            .foregroundColor(.gray)
                                    }
                                    .padding(.vertical, 16)
                                    .padding(.horizontal, 20)
                                    .background(Color(red: 0.1, green: 0.1, blue: 0.14))
                                }
                                
                                // PIN Code Setup Row
                                Button(action: { showPinModal = true }) {
                                    HStack {
                                        Image(systemName: "lock.shield")
                                            .foregroundColor(.blue)
                                        Text("Accountability PIN")
                                            .foregroundColor(.white)
                                        Spacer()
                                        Text("Configured")
                                            .foregroundColor(.gray)
                                        Image(systemName: "chevron.right")
                                            .font(.caption)
                                            .foregroundColor(.gray)
                                    }
                                    .padding(.vertical, 16)
                                    .padding(.horizontal, 20)
                                    .background(Color(red: 0.1, green: 0.1, blue: 0.14))
                                }
                            }
                            .cornerRadius(16)
                            .padding(.horizontal, 20)
                        }
                        
                        // MARK: - Status Panel
                        VStack(alignment: .leading, spacing: 12) {
                            Text("STATUS")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(.gray)
                                .padding(.horizontal, 28)
                            
                            HStack {
                                Circle()
                                    .fill(.green)
                                    .frame(width: 8, height: 8)
                                Text("Active Shielding")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.white)
                                Spacer()
                                Text("Shields Enabled")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(.green)
                            }
                            .padding(16)
                            .background(Color(red: 0.1, green: 0.1, blue: 0.14))
                            .cornerRadius(16)
                            .padding(.horizontal, 20)
                        }
                    }
                    .padding(.top, 16)
                }
            }
            .navigationTitle("ScrollStop")
            .navigationBarTitleDisplayMode(.inline)
            
            // Limit Adjust Sheet
            .sheet(isPresented: $showLimitModal) {
                VStack(spacing: 24) {
                    Text("Adjust Scroll Limit")
                        .font(.headline)
                        .foregroundColor(.white)
                    
                    Text("\(Int(newLimitValue)) Reels/Shorts")
                        .font(.system(size: 40, weight: .bold))
                        .foregroundColor(.blue)
                    
                    Slider(value: $newLimitValue, in: 1...50, step: 1)
                        .accentColor(.blue)
                    
                    Button("Save Limit") {
                        dailyLimit = Int(newLimitValue)
                        showLimitModal = false
                    }
                    .font(.system(size: 16, weight: .bold))
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .padding(32)
                .background(Color(red: 0.08, green: 0.08, blue: 0.12).ignoresSafeArea())
                .presentationDetents([.height(280)])
            }
        }
    }
}
