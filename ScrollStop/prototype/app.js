// ScrollStop Interactive Prototype State Management

// App State
const state = {
    onboardingComplete: false,
    onboardingStep: 1,
    selectedPlatforms: ['instagram', 'youtube'],
    dailyLimit: 15,
    pin: '',
    reelsWatchedToday: 12,
    blockTriggered: false,
    cooldownRemaining: 7200, // 2 hours in seconds
    timerInterval: null,
    weeklyStats: [8, 14, 18, 5, 22, 11, 12] // watched reels per day (Sun-Sat), Saturday is current day
};

// SVG stats charts helper
const renderStatsChart = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const limit = state.dailyLimit;
    const maxVal = Math.max(...state.weeklyStats, limit, 20);
    const chartHeight = 100;
    const barWidth = 24;
    const gap = 16;
    const startX = 22;
    
    let svgContent = '';
    
    // Draw horizontal limit guide line
    const limitY = chartHeight - (limit / maxVal) * chartHeight;
    svgContent += `
        <line x1="15" y1="${limitY}" x2="310" y2="${limitY}" 
              stroke="rgba(245, 158, 11, 0.4)" stroke-width="1" stroke-dasharray="4,4" />
        <text x="312" y="${limitY + 3}" fill="rgba(245, 158, 11, 0.7)" font-size="8" font-weight="600">LIMIT</text>
    `;
    
    state.weeklyStats.forEach((val, index) => {
        const x = startX + index * (barWidth + gap);
        const barHeight = (val / maxVal) * chartHeight;
        const y = chartHeight - barHeight;
        const isLimitExceeded = val >= limit;
        const barClass = isLimitExceeded ? 'chart-bar limit-exceeded' : 'chart-bar';
        
        svgContent += `
            <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
                  class="${barClass}" rx="4" />
            <text x="${x + barWidth/2}" y="${chartHeight + 16}" class="chart-text">${days[index]}</text>
            <text x="${x + barWidth/2}" y="${y - 4}" class="chart-text" font-weight="600" 
                  fill="${isLimitExceeded ? 'var(--accent-amber)' : 'var(--color-text-primary)'}">${val}</text>
        `;
    });
    
    return `
        <svg class="chart-svg" viewBox="0 0 340 130">
            ${svgContent}
        </svg>
    `;
};

// Onboarding Steps Screen HTML Builders
const screens = {
    onboarding: {
        1: () => `
            <div class="proto-screen active" id="ob-1">
                <div class="screen-header">
                    <i class="fa-solid fa-hand-holding-hand header-icon"></i>
                    <h2>Welcome to ScrollStop</h2>
                    <p>Reclaim your time from the infinite scroll of Instagram Reels and YouTube Shorts.</p>
                </div>
                <div class="screen-content" style="justify-content: center; align-items: center; text-align: center;">
                    <div class="calm-illustration">
                        <div class="calm-circle"></div>
                        <div class="calm-circle"></div>
                        <i class="fa-solid fa-heart"></i>
                    </div>
                    <p style="font-size: 13px; color: var(--color-text-secondary); max-width: 250px; line-height: 1.5;">
                        We help you build self-control by making short-form video feeds inaccessible once you hit your daily limit.
                    </p>
                </div>
                <div class="screen-footer">
                    <button class="btn-primary" onclick="nextStep()">Get Started</button>
                </div>
            </div>
        `,
        2: () => `
            <div class="proto-screen active" id="ob-2">
                <div class="screen-header">
                    <i class="fa-solid fa-layer-group header-icon"></i>
                    <h2>Select Platforms</h2>
                    <p>Choose which platform's scroll feed you want to monitor and limit.</p>
                </div>
                <div class="screen-content">
                    <div class="platform-card ${state.selectedPlatforms.includes('instagram') ? 'selected' : ''}" 
                         onclick="togglePlatformSelection('instagram')">
                        <div class="platform-info instagram">
                            <i class="fa-brands fa-instagram"></i>
                            <div class="platform-name">
                                <h4>Instagram Reels</h4>
                                <p>Blocks Reels feed only</p>
                            </div>
                        </div>
                        <div class="checkbox"></div>
                    </div>
                    
                    <div class="platform-card ${state.selectedPlatforms.includes('youtube') ? 'selected' : ''}" 
                         onclick="togglePlatformSelection('youtube')">
                        <div class="platform-info youtube">
                            <i class="fa-brands fa-youtube"></i>
                            <div class="platform-name">
                                <h4>YouTube Shorts</h4>
                                <p>Blocks Shorts player only</p>
                            </div>
                        </div>
                        <div class="checkbox"></div>
                    </div>
                </div>
                <div class="screen-footer">
                    <button class="btn-primary" onclick="nextStep()" ${state.selectedPlatforms.length === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>Continue</button>
                    <button class="btn-link" onclick="prevStep()">Back</button>
                </div>
            </div>
        `,
        3: () => `
            <div class="proto-screen active" id="ob-3">
                <div class="screen-header">
                    <i class="fa-solid fa-sliders header-icon"></i>
                    <h2>Set Scroll Limit</h2>
                    <p>Choose how many reels or shorts you want to allow yourself each day.</p>
                </div>
                <div class="screen-content">
                    <div class="slider-container">
                        <div class="limit-display">
                            <h3 id="slider-val-display">${state.dailyLimit}</h3>
                            <p>Reels/Shorts daily</p>
                        </div>
                        <input type="range" min="1" max="50" value="${state.dailyLimit}" 
                               class="modern-slider" id="onboarding-slider" oninput="updateLimitValue(this.value)">
                    </div>
                    <p style="font-size: 12px; color: var(--color-text-secondary); text-align: center; line-height: 1.5;">
                        Tip: Start with a moderate limit (e.g. 15) and gradually decrease it week by week.
                    </p>
                </div>
                <div class="screen-footer">
                    <button class="btn-primary" onclick="nextStep()">Set Limit</button>
                    <button class="btn-link" onclick="prevStep()">Back</button>
                </div>
            </div>
        `,
        4: () => `
            <div class="proto-screen active" id="ob-4">
                <div class="screen-header">
                    <i class="fa-solid fa-key header-icon"></i>
                    <h2>Accountability PIN</h2>
                    <p>Optionally set a 4-digit PIN. To bypass limits, you'll need a partner or guardian to enter this PIN.</p>
                </div>
                <div class="screen-content">
                    <div class="pin-input-container">
                        <input type="password" maxlength="1" class="pin-digit" onkeyup="pinDigitInput(this, 1)" id="p1">
                        <input type="password" maxlength="1" class="pin-digit" onkeyup="pinDigitInput(this, 2)" id="p2">
                        <input type="password" maxlength="1" class="pin-digit" onkeyup="pinDigitInput(this, 3)" id="p3">
                        <input type="password" maxlength="1" class="pin-digit" onkeyup="pinDigitInput(this, 4)" id="p4">
                    </div>
                    <p style="font-size: 11px; color: var(--color-text-secondary); text-align: center; line-height: 1.4;">
                        Leave blank if you prefer self-discipline (the cooldown timer is mandatory in either case).
                    </p>
                </div>
                <div class="screen-footer">
                    <button class="btn-primary" onclick="savePinAndNext()">Set PIN & Continue</button>
                    <button class="btn-secondary" onclick="skipPinAndNext()">Skip PIN</button>
                    <button class="btn-link" onclick="prevStep()">Back</button>
                </div>
            </div>
        `,
        5: () => `
            <div class="proto-screen active" id="ob-5">
                <div class="screen-header">
                    <i class="fa-solid fa-shield-halved header-icon"></i>
                    <h2>Grant Permissions</h2>
                    <p>ScrollStop requires these permissions to detect swipes and shield content on your device.</p>
                </div>
                <div class="screen-content" style="gap: 12px;">
                    <div class="permission-row">
                        <div class="perm-desc">
                            <i class="fa-solid fa-universal-access"></i>
                            <div>
                                <h4>Accessibility Service (Android)</h4>
                                <p>Used strictly to inspect on-screen URLs/IDs to recognize Reels/Shorts and gestures.</p>
                            </div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="perm-accessibility" onchange="togglePermissionSim('android')">
                            <span class="slider-toggle"></span>
                        </label>
                    </div>
                    
                    <div class="permission-row">
                        <div class="perm-desc">
                            <i class="fa-solid fa-hourglass-half"></i>
                            <div>
                                <h4>Screen Time / Family Controls (iOS)</h4>
                                <p>Used to lock/shield selected apps without collecting or tracking personal usage data.</p>
                            </div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="perm-screentime" onchange="togglePermissionSim('ios')">
                            <span class="slider-toggle"></span>
                        </label>
                    </div>
                </div>
                <div class="screen-footer">
                    <button class="btn-primary" id="btn-perm-continue" onclick="nextStep()" style="opacity: 0.6; pointer-events: none;">Continue</button>
                    <button class="btn-link" onclick="prevStep()">Back</button>
                </div>
            </div>
        `,
        6: () => `
            <div class="proto-screen active" id="ob-6">
                <div class="screen-header">
                    <i class="fa-solid fa-circle-check header-icon" style="color: var(--accent-green)"></i>
                    <h2>You're All Set!</h2>
                    <p>ScrollStop is running and monitoring your scroll feeds in the background.</p>
                </div>
                <div class="screen-content" style="justify-content: center;">
                    <div class="quote-card">
                        <i class="fa-solid fa-quote-left quote-icon"></i>
                        <p>"Rule your mind or it will rule you."</p>
                        <span>— Horace</span>
                    </div>
                </div>
                <div class="screen-footer">
                    <button class="btn-primary" onclick="completeOnboarding()">Go to Dashboard</button>
                </div>
            </div>
        `
    },
    dashboard: () => `
        <div class="proto-screen active" id="scr-dashboard">
            <div class="nav-header">
                <h3>ScrollStop</h3>
                <div class="profile-btn"><i class="fa-solid fa-shield-halved"></i></div>
            </div>
            
            <div class="screen-content">
                <!-- Statistics Card -->
                <div class="stats-container">
                    <div class="stats-title">
                        <h4>Weekly Reels/Shorts Limit</h4>
                        <span id="stats-percentage">${Math.round((state.reelsWatchedToday / state.dailyLimit) * 100)}% Used</span>
                    </div>
                    
                    ${renderStatsChart()}
                    
                    <div class="stats-summary">
                        <div class="summary-metric">
                            <span>Today</span>
                            <strong><span id="dash-reels-today">${state.reelsWatchedToday}</span> / ${state.dailyLimit}</strong>
                        </div>
                        <div class="summary-metric">
                            <span>Daily Limit</span>
                            <strong>${state.dailyLimit}</strong>
                        </div>
                    </div>
                </div>
                
                <!-- Configurations settings list -->
                <div class="settings-section-title">Configurations</div>
                <div class="settings-list">
                    <div class="settings-item" onclick="openLimitModal()">
                        <div class="settings-item-left">
                            <i class="fa-solid fa-sliders"></i>
                            <span>Daily Scroll Limit</span>
                        </div>
                        <div class="settings-item-right">
                            <span>${state.dailyLimit} Reels</span>
                            <i class="fa-solid fa-chevron-right"></i>
                        </div>
                    </div>
                    
                    <div class="settings-item" onclick="openPinModal()">
                        <div class="settings-item-left">
                            <i class="fa-solid fa-key"></i>
                            <span>Accountability PIN</span>
                        </div>
                        <div class="settings-item-right">
                            <span>${state.pin ? 'Set' : 'None'}</span>
                            <i class="fa-solid fa-chevron-right"></i>
                        </div>
                    </div>
                </div>

                <div class="settings-section-title">Status</div>
                <div class="settings-list">
                    <div class="settings-item" style="cursor: default;">
                        <div class="settings-item-left">
                            <i class="fa-solid fa-circle" style="color: var(--accent-green); font-size: 10px;"></i>
                            <span>Active Monitoring</span>
                        </div>
                        <div class="settings-item-right">
                            <span style="color: var(--accent-green); font-weight: 600;">Running</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

// Interruption Overlay builder
const renderBlockScreen = () => `
    <div class="block-screen" id="block-overlay">
        <div class="block-header">
            <i class="fa-solid fa-hand"></i>
            <h2>Time to Step Away</h2>
            <p>You have scrolled past your limit of ${state.dailyLimit} Reels/Shorts today.</p>
        </div>
        
        <div class="block-illustration-container">
            <div class="calm-illustration">
                <div class="calm-circle"></div>
                <div class="calm-circle"></div>
                <i class="fa-solid fa-seedling"></i>
            </div>
            <div class="block-motivational-text">
                <p>"Take a breath. The digital world can wait. Recharge your real-world energy."</p>
                <span>ScrollStop Mindfulness</span>
            </div>
        </div>
        
        <div class="cooldown-timer-box">
            <span class="timer-label">Reels accessible in</span>
            <div class="timer-digits" id="cooldown-timer">02:00:00</div>
        </div>
        
        <div class="alternatives-container">
            <span>Try these instead</span>
            
            <div class="alternative-card" onclick="alert('Simulating deep-link opening: Kindle / Books App')">
                <div class="alt-content">
                    <i class="fa-solid fa-book-open"></i>
                    <span>Read a chapter in your book</span>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
            </div>
            
            <div class="alternative-card" onclick="alert('Simulating deep-link opening: SMS / Phone Contacts')">
                <div class="alt-content">
                    <i class="fa-solid fa-comment-dots"></i>
                    <span>Message a close friend</span>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
            </div>
            
            <div class="alternative-card" onclick="alert('Simulating deep-link opening: Strava / Maps / Outdoor activities')">
                <div class="alt-content">
                    <i class="fa-solid fa-person-walking"></i>
                    <span>Take a 10-minute walk outside</span>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
            </div>
        </div>
        
        <div class="bypass-btn-container">
            <button class="btn-link" onclick="openBypassModal()">Partner Bypass (PIN)</button>
        </div>
    </div>
`;

// Overlay modalkits (PIN enter/Limit adjusts)
const renderModals = () => `
    <!-- Limit modal -->
    <div class="sim-modal" id="modal-limit">
        <div class="sim-modal-content">
            <div class="sim-modal-header">
                <h3>Adjust Daily Limit</h3>
                <button class="close-modal-btn" onclick="closeModal('limit')"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="slider-container" style="padding-top: 0;">
                <div class="limit-display">
                    <h3 id="limit-modal-val">${state.dailyLimit}</h3>
                    <p>Reels/Shorts daily</p>
                </div>
                <input type="range" min="1" max="50" value="${state.dailyLimit}" 
                       class="modern-slider" id="limit-modal-slider" oninput="updateModalLimitValue(this.value)">
            </div>
            <button class="btn-primary" style="width: 100%; margin-top: 10px;" onclick="saveModalLimit()">Save New Limit</button>
        </div>
    </div>
    
    <!-- PIN modal -->
    <div class="sim-modal" id="modal-pin">
        <div class="sim-modal-content">
            <div class="sim-modal-header">
                <h3>Accountability PIN</h3>
                <button class="close-modal-btn" onclick="closeModal('pin')"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 20px; line-height: 1.5;">
                Enter a 4-digit PIN to secure statistics resets and settings overrides. Give this code to a partner.
            </p>
            <div class="pin-input-container">
                <input type="password" maxlength="1" class="pin-digit" onkeyup="modalPinDigitInput(this, 1)" id="mp1">
                <input type="password" maxlength="1" class="pin-digit" onkeyup="modalPinDigitInput(this, 2)" id="mp2">
                <input type="password" maxlength="1" class="pin-digit" onkeyup="modalPinDigitInput(this, 3)" id="mp3">
                <input type="password" maxlength="1" class="pin-digit" onkeyup="modalPinDigitInput(this, 4)" id="mp4">
            </div>
            <button class="btn-primary" style="width: 100%; margin-top: 10px;" onclick="saveModalPin()">Save PIN</button>
        </div>
    </div>

    <!-- Bypass verification modal -->
    <div class="sim-modal" id="modal-bypass">
        <div class="sim-modal-content">
            <div class="sim-modal-header">
                <h3>Partner PIN Bypass</h3>
                <button class="close-modal-btn" onclick="closeModal('bypass')"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 20px; line-height: 1.5;">
                Enter the accountability PIN to reset today's scroll count. If no PIN was set, you must wait for the timer.
            </p>
            <div class="pin-input-container">
                <input type="password" maxlength="1" class="pin-digit" onkeyup="bypassPinDigitInput(this, 1)" id="bp1">
                <input type="password" maxlength="1" class="pin-digit" onkeyup="bypassPinDigitInput(this, 2)" id="bp2">
                <input type="password" maxlength="1" class="pin-digit" onkeyup="bypassPinDigitInput(this, 3)" id="bp3">
                <input type="password" maxlength="1" class="pin-digit" onkeyup="bypassPinDigitInput(this, 4)" id="bp4">
            </div>
            <button class="btn-primary" style="width: 100%; margin-top: 10px;" onclick="verifyBypassPin()">Authorize Reset</button>
        </div>
    </div>
`;

// App rendering core controller
const renderApp = () => {
    const container = document.getElementById('screen-container');
    
    if (!state.onboardingComplete) {
        container.innerHTML = screens.onboarding[state.onboardingStep]();
    } else {
        container.innerHTML = screens.dashboard() + renderBlockScreen() + renderModals();
        
        // Sync block screen trigger
        const blockOverlay = document.getElementById('block-overlay');
        if (state.blockTriggered || state.reelsWatchedToday >= state.dailyLimit) {
            blockOverlay.classList.add('active');
            startCooldownTimer();
        } else {
            blockOverlay.classList.remove('active');
            stopCooldownTimer();
        }
    }
    
    // Update external simulation panels
    document.getElementById('lbl-sim-scrolls').innerText = state.reelsWatchedToday;
    document.getElementById('lbl-sim-limit').innerText = state.dailyLimit;
    
    // Sync Saturday stats bar count with today's count
    state.weeklyStats[6] = state.reelsWatchedToday;
};

// Navigation functions
const nextStep = () => {
    state.onboardingStep++;
    renderApp();
};

const prevStep = () => {
    state.onboardingStep--;
    renderApp();
};

const completeOnboarding = () => {
    state.onboardingComplete = true;
    renderApp();
};

// Platform selection toggle
const togglePlatformSelection = (platform) => {
    const idx = state.selectedPlatforms.indexOf(platform);
    if (idx > -1) {
        state.selectedPlatforms.splice(idx, 1);
    } else {
        state.selectedPlatforms.push(platform);
    }
    renderApp();
};

// Onboarding limit slider input handler
const updateLimitValue = (val) => {
    state.dailyLimit = parseInt(val);
    document.getElementById('slider-val-display').innerText = val;
};

// Pin Setup digit auto-focusing
const pinDigitInput = (input, position) => {
    if (input.value && position < 4) {
        document.getElementById(`p${position + 1}`).focus();
    }
};

const savePinAndNext = () => {
    const p1 = document.getElementById('p1').value;
    const p2 = document.getElementById('p2').value;
    const p3 = document.getElementById('p3').value;
    const p4 = document.getElementById('p4').value;
    
    state.pin = p1 + p2 + p3 + p4;
    
    nextStep();
};

const skipPinAndNext = () => {
    state.pin = '';
    nextStep();
};

// Permission simulator activation
const togglePermissionSim = (platform) => {
    const acc = document.getElementById('perm-accessibility').checked;
    const scr = document.getElementById('perm-screentime').checked;
    const continueBtn = document.getElementById('btn-perm-continue');
    
    if (acc || scr) {
        continueBtn.style.opacity = '1';
        continueBtn.style.pointerEvents = 'all';
    } else {
        continueBtn.style.opacity = '0.6';
        continueBtn.style.pointerEvents = 'none';
    }
};

// Modals display mechanisms
const openLimitModal = () => {
    document.getElementById('modal-limit').classList.add('active');
    document.getElementById('limit-modal-slider').value = state.dailyLimit;
    document.getElementById('limit-modal-val').innerText = state.dailyLimit;
};

const openPinModal = () => {
    document.getElementById('modal-pin').classList.add('active');
    document.getElementById('mp1').value = '';
    document.getElementById('mp2').value = '';
    document.getElementById('mp3').value = '';
    document.getElementById('mp4').value = '';
};

const openBypassModal = () => {
    if (!state.pin) {
        alert("No accountability PIN was configured. You must wait for the cooldown timer.");
        return;
    }
    document.getElementById('modal-bypass').classList.add('active');
    document.getElementById('bp1').value = '';
    document.getElementById('bp2').value = '';
    document.getElementById('bp3').value = '';
    document.getElementById('bp4').value = '';
};

const closeModal = (modalName) => {
    document.getElementById(`modal-${modalName}`).classList.remove('active');
};

const updateModalLimitValue = (val) => {
    document.getElementById('limit-modal-val').innerText = val;
};

const saveModalLimit = () => {
    state.dailyLimit = parseInt(document.getElementById('limit-modal-slider').value);
    closeModal('limit');
    renderApp();
};

const modalPinDigitInput = (input, pos) => {
    if (input.value && pos < 4) {
        document.getElementById(`mp${pos + 1}`).focus();
    }
};

const saveModalPin = () => {
    const mp1 = document.getElementById('mp1').value;
    const mp2 = document.getElementById('mp2').value;
    const mp3 = document.getElementById('mp3').value;
    const mp4 = document.getElementById('mp4').value;
    
    state.pin = mp1 + mp2 + mp3 + mp4;
    closeModal('pin');
    renderApp();
};

// Bypass Pin digit logic
const bypassPinDigitInput = (input, pos) => {
    if (input.value && pos < 4) {
        document.getElementById(`bp${pos + 1}`).focus();
    }
};

const verifyBypassPin = () => {
    const bp1 = document.getElementById('bp1').value;
    const bp2 = document.getElementById('bp2').value;
    const bp3 = document.getElementById('bp3').value;
    const bp4 = document.getElementById('bp4').value;
    
    const enteredPin = bp1 + bp2 + bp3 + bp4;
    
    if (enteredPin === state.pin) {
        state.reelsWatchedToday = 0;
        state.blockTriggered = false;
        closeModal('bypass');
        renderApp();
        alert("Bypass authorized. Limits reset successfully.");
    } else {
        alert("Incorrect accountability PIN. Please try again.");
    }
};

// Cooldown countdown manager
const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const startCooldownTimer = () => {
    if (state.timerInterval) return;
    
    const timerDisplay = document.getElementById('cooldown-timer');
    if (timerDisplay) {
        timerDisplay.innerText = formatTime(state.cooldownRemaining);
    }
    
    state.timerInterval = setInterval(() => {
        if (state.cooldownRemaining > 0) {
            state.cooldownRemaining--;
            const label = document.getElementById('cooldown-timer');
            if (label) {
                label.innerText = formatTime(state.cooldownRemaining);
            }
        } else {
            // Timer finished!
            state.reelsWatchedToday = 0;
            state.blockTriggered = false;
            state.cooldownRemaining = 7200;
            stopCooldownTimer();
            renderApp();
        }
    }, 1000);
};

const stopCooldownTimer = () => {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
};

// Time on Status Bar simulation
const updatePhoneTime = () => {
    const date = new Date();
    const hrs = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hrs}:${mins}`;
    
    const element = document.getElementById('phone-time');
    if (element) {
        element.innerText = timeStr;
    }
};

// Sidebar simulator action bindings
document.addEventListener('DOMContentLoaded', () => {
    // Clock
    updatePhoneTime();
    setInterval(updatePhoneTime, 60000);
    
    // Initial Render
    renderApp();
    
    // Decrement Scrolls Click
    document.getElementById('btn-dec-scroll').addEventListener('click', () => {
        if (state.reelsWatchedToday > 0) {
            state.reelsWatchedToday--;
            if (state.reelsWatchedToday < state.dailyLimit) {
                state.blockTriggered = false;
            }
            renderApp();
        }
    });

    // Increment Scrolls Click
    document.getElementById('btn-inc-scroll').addEventListener('click', () => {
        state.reelsWatchedToday++;
        renderApp();
    });

    // Force Trigger Block Screen
    document.getElementById('btn-trigger-block').addEventListener('click', () => {
        if (!state.onboardingComplete) {
            alert("Please complete the onboarding flow first.");
            return;
        }
        state.blockTriggered = true;
        renderApp();
    });

    // Reset Simulation
    document.getElementById('btn-reset-prototype').addEventListener('click', () => {
        state.onboardingComplete = false;
        state.onboardingStep = 1;
        state.dailyLimit = 15;
        state.pin = '';
        state.reelsWatchedToday = 12;
        state.blockTriggered = false;
        state.cooldownRemaining = 7200;
        state.selectedPlatforms = ['instagram', 'youtube'];
        stopCooldownTimer();
        renderApp();
    });
});
