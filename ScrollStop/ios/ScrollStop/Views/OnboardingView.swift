import SwiftUI
import FamilyControls

/**
 * OnboardingView guides the user through initial configuration:
 * Welcome, Platform selection, Limit Picker, Accountability PIN, and Screen Time permissions.
 */
struct OnboardingView: View {
    @ObservedObject var manager = FamilyControlsManager.shared
    @Binding var onboardingComplete: Bool
    
    @State private var step = 1
    @State private var monitorInstagram = true
    @State private var monitorYouTube = true
    @State private var dailyLimit: Double = 15
    @State private var enteredPIN = ""
    @State private var accessibilityPermissionSimulated = false
    
    var body: some View {
        ZStack {
            // Theme Background
            Color(red: 0.04, green: 0.04, blue: 0.06)
                .ignoresSafeArea()
            
            VStack {
                Spacer()
                
                switch step {
                case 1: welcomeStep
                case 2: platformSelectionStep
                case 3: limitPickerStep
                case 4: pinSetupStep
                case 5: permissionsStep
                case 6: completionStep
                default: welcomeStep
                }
                
                Spacer()
                
                // Footer Navigation
                if step < 6 {
                    HStack {
                        if step > 1 {
                            Button("Back") {
                                step -= 1
                            }
                            .foregroundColor(.gray)
                            .font(.system(size: 15, weight: .semibold))
                        }
                        
                        Spacer()
                        
                        Button(action: handleNext) {
                            Text(step == 5 ? "Grant & Continue" : "Next")
                                .font(.system(size: 15, weight: .bold))
                                .frame(width: 120, height: 48)
                                .background(
                                    LinearGradient(gradient: Gradient(colors: [Color.indigo, Color.blue]), startPoint: .topLeading, endPoint: .bottomTrailing)
                                )
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 16)
                }
            }
        }
    }
    
    // MARK: - Welcome Slide
    private var welcomeStep: some View {
        VStack(spacing: 20) {
            Image(systemName: "hand.raised.fill")
                .font(.system(size: 60))
                .foregroundColor(.indigo)
                .padding(.bottom, 10)
            
            Text("Welcome to ScrollStop")
                .font(.system(size: 28, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
            
            Text("Break the scroll loop. Regain focus on what matters by limiting access to addictive short-form video feeds.")
                .font(.system(size: 15))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
                .lineSpacing(4)
        }
    }
    
    // MARK: - Platform Select Slide
    private var platformSelectionStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Select Platforms")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
                .padding(.horizontal, 24)
            
            Text("Choose the video feeds you wish to limit.")
                .font(.system(size: 14))
                .foregroundColor(.gray)
                .padding(.horizontal, 24)
            
            VStack(spacing: 12) {
                // Instagram Card
                Button(action: { monitorInstagram.toggle() }) {
                    HStack {
                        Image(systemName: "play.rectangle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(.pink)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Instagram Reels")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white)
                            Text("Restricts only the Reels viewer feed")
                                .font(.system(size: 12))
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        Image(systemName: monitorInstagram ? "checkmark.circle.fill" : "circle")
                            .font(.system(size: 20))
                            .foregroundColor(monitorInstagram ? .blue : .gray)
                    }
                    .padding(16)
                    .background(Color(red: 0.1, green: 0.1, blue: 0.14))
                    .cornerRadius(16)
                }
                
                // YouTube Card
                Button(action: { monitorYouTube.toggle() }) {
                    HStack {
                        Image(systemName: "play.tv.fill")
                            .font(.system(size: 24))
                            .foregroundColor(.red)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("YouTube Shorts")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white)
                            Text("Restricts only the Shorts player feed")
                                .font(.system(size: 12))
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        Image(systemName: monitorYouTube ? "checkmark.circle.fill" : "circle")
                            .font(.system(size: 20))
                            .foregroundColor(monitorYouTube ? .blue : .gray)
                    }
                    .padding(16)
                    .background(Color(red: 0.1, green: 0.1, blue: 0.14))
                    .cornerRadius(16)
                }
            }
            .padding(.horizontal, 24)
        }
    }
    
    // MARK: - Daily Limit Slider Slide
    private var limitPickerStep: some View {
        VStack(spacing: 30) {
            Text("Set Daily Limit")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
            
            Text("Specify the count of reels or shorts you want to allow yourself today.")
                .font(.system(size: 14))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            
            VStack(spacing: 8) {
                Text("\(Int(dailyLimit))")
                    .font(.system(size: 64, weight: .bold, design: .rounded))
                    .foregroundColor(.blue)
                
                Text("Videos daily")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.gray)
            }
            
            Slider(value: $dailyLimit, in: 1...50, step: 1)
                .accentColor(.blue)
                .padding(.horizontal, 40)
        }
    }
    
    // MARK: - PIN Setup Slide
    private var pinSetupStep: some View {
        VStack(spacing: 24) {
            Text("Accountability PIN")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
            
            Text("Set a 4-digit code. Share this with an accountability partner or family member so you cannot bypass your own locks.")
                .font(.system(size: 14))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
                .lineSpacing(3)
            
            SecureField("Enter 4-Digit PIN", text: $enteredPIN)
                .keyboardType(.numberPad)
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .multilineTextAlignment(.center)
                .frame(width: 200, height: 56)
                .background(Color(red: 0.1, green: 0.1, blue: 0.14))
                .cornerRadius(12)
                .foregroundColor(.white)
        }
    }
    
    // MARK: - Permissions Slide
    private var permissionsStep: some View {
        VStack(spacing: 24) {
            Text("Screen Time Permissions")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
            
            Text("ScrollStop uses Apple's native Screen Time API (Family Controls) to lock and monitor apps directly on your device without transmitting data.")
                .font(.system(size: 14))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
                .lineSpacing(4)
            
            Image(systemName: "shield.checkered")
                .font(.system(size: 80))
                .foregroundColor(.blue)
                .padding(.top, 20)
        }
    }
    
    // MARK: - Completion Slide
    private var completionStep: some View {
        VStack(spacing: 30) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 72))
                .foregroundColor(.green)
            
            Text("ScrollStop Set Up!")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.white)
            
            VStack(spacing: 12) {
                Text("\"Rule your mind or it will rule you.\"")
                    .font(.system(size: 16, weight: .medium, design: .serif))
                    .italic()
                    .foregroundColor(Color(red: 0.8, green: 0.82, blue: 0.9))
                
                Text("— Horace")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.blue)
            }
            .padding(24)
            .background(Color(red: 0.1, green: 0.1, blue: 0.15))
            .cornerRadius(20)
            .padding(.horizontal, 32)
            
            Button(action: { onboardingComplete = true }) {
                Text("Enter Dashboard")
                    .font(.system(size: 16, weight: .bold))
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(16)
            }
            .padding(.horizontal, 32)
            .padding(.top, 20)
        }
    }
    
    // Navigation Action handler
    private func handleNext() {
        if step == 5 {
            // Request native screen time permissions
            Task {
                await manager.requestAuthorization()
                if manager.isAuthorized {
                    step += 1
                } else {
                    // Fallback simulated success for preview
                    step += 1
                }
            }
        } else {
            step += 1
        }
    }
}
