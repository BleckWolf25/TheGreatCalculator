/**
 * @file ACCESSIBILITY SETTINGS MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Accessibility settings panel for The Great Calculator allowing users
 * to customize accessibility features based on their specific needs.
 * Provides comprehensive controls for motor, cognitive, visual, and auditory accessibility.
 *
 * Features:
 * - Motor accessibility settings (dwell control, large targets, sticky keys)
 * - Cognitive accessibility settings (simplified interface, confirmations, help)
 * - Visual accessibility settings (high contrast, large text, color blindness support)
 * - Audio accessibility settings (haptic feedback, visual indicators)
 * - Voice control settings and configuration
 * - Settings persistence and restoration
 */

// ------------ ACCESSIBILITY SETTINGS CLASS

/**
 * Accessibility Settings Class
 *
 * Manages accessibility settings panel and user preferences for
 * comprehensive disability support in the calculator.
 *
 * @class AccessibilitySettings
 * @example
 * const settings = new AccessibilitySettings(accessibilityManager);
 * settings.showSettingsPanel();
 */
class AccessibilitySettings {
    /**
     * Create accessibility settings instance
     *
     * @constructor
     * @param {AccessibilityManager} accessibilityManager - Accessibility manager instance
     */
    constructor(accessibilityManager) {
        /** @type {AccessibilityManager} Reference to accessibility manager */
        this.accessibilityManager = accessibilityManager;

        /** @type {HTMLElement|null} Settings panel element */
        this.settingsPanel = null;

        /** @type {Object} Default settings */
        this.defaultSettings = {
            motorAccessibility: {
                dwellControl: false,
                dwellTime: 1000,
                largeTargets: false,
                stickyKeys: false,
                reducedMotion: false
            },
            cognitiveAccessibility: {
                simplifiedInterface: false,
                confirmActions: false,
                contextualHelp: true,
                timeoutWarnings: true,
                dyslexiaSupport: false
            },
            visualAccessibility: {
                highContrast: false,
                largeText: false,
                colorBlindnessSupport: false,
                reducedTransparency: false,
                fontSize: 16
            },
            audioAccessibility: {
                hapticFeedback: true,
                visualIndicators: true,
                soundEnabled: true
            },
            voiceControl: {
                enabled: false,
                confidence: 0.8,
                language: 'en-US'
            }
        };

        this.init();
    }

    /**
     * Initialize accessibility settings
     *
     * @method init
     * @returns {void}
     */
    init() {
        this.loadSettings();
        this.createSettingsPanel();
        this.setupEventListeners();

        console.log('♿ Accessibility settings initialized');
    }

    /**
     * Create accessibility settings panel
     *
     * @method createSettingsPanel
     * @returns {void}
     */
    createSettingsPanel() {
        this.settingsPanel = document.createElement('div');
        this.settingsPanel.id = 'accessibility-settings';
        this.settingsPanel.className = 'accessibility-settings-panel';
        this.settingsPanel.setAttribute('role', 'dialog');
        this.settingsPanel.setAttribute('aria-labelledby', 'accessibility-settings-title');
        this.settingsPanel.setAttribute('aria-hidden', 'true');

        this.settingsPanel.innerHTML = `
            <div class="settings-content">
                <header class="settings-header">
                    <h2 id="accessibility-settings-title">Accessibility Settings</h2>
                    <button class="close-settings" aria-label="Close accessibility settings">×</button>
                </header>

                <div class="settings-body">
                    <div class="settings-section">
                        <h3>Motor Accessibility</h3>
                        <p class="section-description">Settings for users with motor disabilities</p>

                        <label class="setting-item">
                            <input type="checkbox" id="dwell-control" aria-describedby="dwell-control-desc">
                            <span class="setting-label">Dwell Control (Hover to Click)</span>
                            <span id="dwell-control-desc" class="setting-description">
                                Activate buttons by hovering for a set time
                            </span>
                        </label>

                        <label class="setting-item" id="dwell-time-container">
                            <span class="setting-label">Dwell Time (milliseconds)</span>
                            <input type="range" id="dwell-time" min="500" max="3000" step="100" value="1000">
                            <span class="setting-value" id="dwell-time-value">1000ms</span>
                        </label>

                        <label class="setting-item">
                            <input type="checkbox" id="large-targets">
                            <span class="setting-label">Large Target Areas</span>
                            <span class="setting-description">
                                Increase button sizes for easier interaction
                            </span>
                        </label>

                        <label class="setting-item">
                            <input type="checkbox" id="sticky-keys">
                            <span class="setting-label">Sticky Keys</span>
                            <span class="setting-description">
                                Modifier keys stay active without holding
                            </span>
                        </label>

                        <label class="setting-item">
                            <input type="checkbox" id="reduced-motion">
                            <span class="setting-label">Reduced Motion</span>
                            <span class="setting-description">
                                Minimize animations and transitions
                            </span>
                        </label>
                    </div>

                    <div class="settings-section">
                        <h3>Cognitive Accessibility</h3>
                        <p class="section-description">Settings for users with cognitive disabilities</p>

                        <label class="setting-item">
                            <input type="checkbox" id="simplified-interface">
                            <span class="setting-label">Simplified Interface</span>
                            <span class="setting-description">
                                Hide advanced features and reduce complexity
                            </span>
                        </label>

                        <label class="setting-item">
                            <input type="checkbox" id="confirm-actions">
                            <span class="setting-label">Confirm Destructive Actions</span>
                            <span class="setting-description">
                                Ask for confirmation before clearing or resetting
                            </span>
                        </label>

                        <label class="setting-item">
                            <input type="checkbox" id="contextual-help">
                            <span class="setting-label">Contextual Help</span>
                            <span class="setting-description">
                                Show help buttons and instructions
                            </span>
                        </label>

                        <label class="setting-item">
                            <input type="checkbox" id="timeout-warnings">
                            <span class="setting-label">Timeout Warnings</span>
                            <span class="setting-description">
                                Warn before automatic session timeouts
                            </span>
                        </label>

                        <label class="setting-item">
                            <input type="checkbox" id="dyslexia-support">
                            <span class="setting-label">Dyslexia Support</span>
                            <span class="setting-description">
                                Use dyslexia-friendly fonts and spacing
                            </span>
                        </label>
                    </div>

                    <div class="settings-section">
                        <h3>Visual Accessibility</h3>
                        <p class="section-description">Settings for users with visual impairments</p>

                        <label class="setting-item">
                            <input type="checkbox" id="high-contrast">
                            <span class="setting-label">High Contrast Mode</span>
                            <span class="setting-description">
                                Use high contrast colors for better visibility
                            </span>
                        </label>

                        <label class="setting-item">
                            <input type="checkbox" id="large-text">
                            <span class="setting-label">Large Text</span>
                            <span class="setting-description">
                                Increase text size for better readability
                            </span>
                        </label>

                        <label class="setting-item">
                            <span class="setting-label">Font Size</span>
                            <input type="range" id="font-size" min="12" max="24" step="1" value="16">
                            <span class="setting-value" id="font-size-value">16px</span>
                        </label>

                        <label class="setting-item">
                            <input type="checkbox" id="colorblind-support">
                            <span class="setting-label">Color Blindness Support</span>
                            <span class="setting-description">
                                Add patterns and shapes to color-coded elements
                            </span>
                        </label>

                        <label class="setting-item">
                            <input type="checkbox" id="reduced-transparency">
                            <span class="setting-label">Reduced Transparency</span>
                            <span class="setting-description">
                                Remove transparent effects
                            </span>
                        </label>
                    </div>

                    <div class="settings-section">
                        <h3>Audio Accessibility</h3>
                        <p class="section-description">Settings for users with hearing impairments</p>

                        <label class="setting-item">
                            <input type="checkbox" id="haptic-feedback">
                            <span class="setting-label">Haptic Feedback</span>
                            <span class="setting-description">
                                Vibrate on button presses (mobile devices)
                            </span>
                        </label>

                        <label class="setting-item">
                            <input type="checkbox" id="visual-indicators">
                            <span class="setting-label">Visual Indicators</span>
                            <span class="setting-description">
                                Show visual feedback for audio cues
                            </span>
                        </label>

                        <label class="setting-item">
                            <input type="checkbox" id="sound-enabled">
                            <span class="setting-label">Sound Effects</span>
                            <span class="setting-description">
                                Enable audio feedback for interactions
                            </span>
                        </label>
                    </div>

                    <div class="settings-section">
                        <h3>Voice Control</h3>
                        <p class="section-description">Voice commands for hands-free operation</p>

                        <label class="setting-item">
                            <input type="checkbox" id="voice-control">
                            <span class="setting-label">Enable Voice Control</span>
                            <span class="setting-description">
                                Control calculator with voice commands
                            </span>
                        </label>

                        <label class="setting-item">
                            <span class="setting-label">Recognition Confidence</span>
                            <input type="range" id="voice-confidence" min="0.5" max="1.0" step="0.1" value="0.8">
                            <span class="setting-value" id="voice-confidence-value">80%</span>
                        </label>

                        <div class="voice-commands-help">
                            <h4>Voice Commands:</h4>
                            <ul>
                                <li>"Zero" through "Nine" - Enter numbers</li>
                                <li>"Plus", "Add" - Addition</li>
                                <li>"Minus", "Subtract" - Subtraction</li>
                                <li>"Times", "Multiply" - Multiplication</li>
                                <li>"Divide" - Division</li>
                                <li>"Equals", "Calculate" - Perform calculation</li>
                                <li>"Clear" - Clear all</li>
                                <li>"Decimal", "Point" - Decimal point</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <footer class="settings-footer">
                    <button class="btn-primary" id="save-settings">Save Settings</button>
                    <button class="btn-secondary" id="reset-settings">Reset to Defaults</button>
                    <button class="btn-secondary" id="cancel-settings">Cancel</button>
                </footer>
            </div>
        `;

        document.body.appendChild(this.settingsPanel);
        this.addSettingsStyles();
    }

    /**
     * Add CSS styles for settings panel
     *
     * @method addSettingsStyles
     * @returns {void}
     * @private
     */
    addSettingsStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .accessibility-settings-panel {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .accessibility-settings-panel[aria-hidden="false"] {
                opacity: 1;
                visibility: visible;
            }

            .settings-content {
                background: white;
                border-radius: 8px;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }

            .settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #dee2e6;
            }

            .settings-header h2 {
                margin: 0;
                color: #333;
            }

            .close-settings {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
            }

            .close-settings:hover,
            .close-settings:focus {
                background: #f8f9fa;
            }

            .settings-body {
                padding: 20px;
            }

            .settings-section {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e9ecef;
            }

            .settings-section:last-child {
                border-bottom: none;
            }

            .settings-section h3 {
                margin: 0 0 8px 0;
                color: #495057;
                font-size: 1.2em;
            }

            .section-description {
                margin: 0 0 16px 0;
                color: #6c757d;
                font-size: 0.9em;
            }

            .setting-item {
                display: block;
                margin-bottom: 16px;
                cursor: pointer;
            }

            .setting-label {
                display: block;
                font-weight: 500;
                margin-bottom: 4px;
                color: #333;
            }

            .setting-description {
                display: block;
                font-size: 0.85em;
                color: #6c757d;
                margin-top: 4px;
            }

            .setting-item input[type="checkbox"] {
                margin-right: 8px;
            }

            .setting-item input[type="range"] {
                width: 100%;
                margin: 8px 0;
            }

            .setting-value {
                font-weight: 500;
                color: #007bff;
            }

            .voice-commands-help {
                background: #f8f9fa;
                padding: 16px;
                border-radius: 4px;
                margin-top: 16px;
            }

            .voice-commands-help h4 {
                margin: 0 0 12px 0;
                color: #495057;
            }

            .voice-commands-help ul {
                margin: 0;
                padding-left: 20px;
            }

            .voice-commands-help li {
                margin-bottom: 4px;
                font-size: 0.9em;
            }

            .settings-footer {
                padding: 20px;
                border-top: 1px solid #dee2e6;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .settings-footer button {
                padding: 8px 16px;
                border-radius: 4px;
                border: 1px solid #dee2e6;
                cursor: pointer;
                font-size: 0.9em;
            }

            .btn-primary {
                background: #007bff;
                color: white;
                border-color: #007bff;
            }

            .btn-primary:hover,
            .btn-primary:focus {
                background: #0056b3;
                border-color: #0056b3;
            }

            .btn-secondary {
                background: #6c757d;
                color: white;
                border-color: #6c757d;
            }

            .btn-secondary:hover,
            .btn-secondary:focus {
                background: #545b62;
                border-color: #545b62;
            }

            #dwell-time-container {
                display: none;
            }

            #dwell-time-container.visible {
                display: block;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup event listeners for settings panel
     *
     * @method setupEventListeners
     * @returns {void}
     * @private
     */
    setupEventListeners() {
        // Close button
        const closeButton = this.settingsPanel.querySelector('.close-settings');
        closeButton.addEventListener('click', () => this.hideSettingsPanel());

        // Save button
        const saveButton = this.settingsPanel.querySelector('#save-settings');
        saveButton.addEventListener('click', () => this.saveSettings());

        // Reset button
        const resetButton = this.settingsPanel.querySelector('#reset-settings');
        resetButton.addEventListener('click', () => this.resetSettings());

        // Cancel button
        const cancelButton = this.settingsPanel.querySelector('#cancel-settings');
        cancelButton.addEventListener('click', () => this.hideSettingsPanel());

        // Dwell control checkbox
        const dwellControl = this.settingsPanel.querySelector('#dwell-control');
        const dwellTimeContainer = this.settingsPanel.querySelector('#dwell-time-container');
        dwellControl.addEventListener('change', (e) => {
            dwellTimeContainer.classList.toggle('visible', e.target.checked);
        });

        // Range inputs
        this.setupRangeInputs();

        // Voice control
        const voiceControl = this.settingsPanel.querySelector('#voice-control');
        voiceControl.addEventListener('change', (e) => {
            if (e.target.checked && !this.checkVoiceControlSupport()) {
                e.target.checked = false;
                alert('Voice control is not supported in this browser.');
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.settingsPanel.getAttribute('aria-hidden') === 'false') {
                this.hideSettingsPanel();
            }
        });
    }

    /**
     * Setup range input event listeners
     *
     * @method setupRangeInputs
     * @returns {void}
     * @private
     */
    setupRangeInputs() {
        // Dwell time
        const dwellTime = this.settingsPanel.querySelector('#dwell-time');
        const dwellTimeValue = this.settingsPanel.querySelector('#dwell-time-value');
        dwellTime.addEventListener('input', (e) => {
            dwellTimeValue.textContent = `${e.target.value}ms`;
        });

        // Font size
        const fontSize = this.settingsPanel.querySelector('#font-size');
        const fontSizeValue = this.settingsPanel.querySelector('#font-size-value');
        fontSize.addEventListener('input', (e) => {
            fontSizeValue.textContent = `${e.target.value}px`;
        });

        // Voice confidence
        const voiceConfidence = this.settingsPanel.querySelector('#voice-confidence');
        const voiceConfidenceValue = this.settingsPanel.querySelector('#voice-confidence-value');
        voiceConfidence.addEventListener('input', (e) => {
            voiceConfidenceValue.textContent = `${Math.round(e.target.value * 100)}%`;
        });
    }

    /**
     * Show accessibility settings panel
     *
     * @method showSettingsPanel
     * @returns {void}
     */
    showSettingsPanel() {
        try {
            this.loadCurrentSettings();
            this.settingsPanel.setAttribute('aria-hidden', 'false');
        } catch (error) {
            console.error('❌ Error showing accessibility settings panel:', error);
            // Still show the panel but with default settings
            this.settingsPanel.setAttribute('aria-hidden', 'false');
        }

        // Focus first focusable element
        const firstFocusable = this.settingsPanel.querySelector('button, input, select, textarea');
        if (firstFocusable) {
            firstFocusable.focus();
        }

        // Announce to screen reader
        this.accessibilityManager.announceToScreenReader('Accessibility settings panel opened');
    }

    /**
     * Hide accessibility settings panel
     *
     * @method hideSettingsPanel
     * @returns {void}
     */
    hideSettingsPanel() {
        this.settingsPanel.setAttribute('aria-hidden', 'true');
        this.accessibilityManager.announceToScreenReader('Accessibility settings panel closed');
    }

    /**
     * Load current settings into the panel
     *
     * @method loadCurrentSettings
     * @returns {void}
     * @private
     */
    loadCurrentSettings() {
        try {
            const settings = this.getCurrentSettings();

        // Motor accessibility
        this.settingsPanel.querySelector('#dwell-control').checked = settings.motorAccessibility.dwellControl;
        this.settingsPanel.querySelector('#dwell-time').value = settings.motorAccessibility.dwellTime;
        this.settingsPanel.querySelector('#dwell-time-value').textContent = `${settings.motorAccessibility.dwellTime}ms`;
        this.settingsPanel.querySelector('#large-targets').checked = settings.motorAccessibility.largeTargets;
        this.settingsPanel.querySelector('#sticky-keys').checked = settings.motorAccessibility.stickyKeys;
        this.settingsPanel.querySelector('#reduced-motion').checked = settings.motorAccessibility.reducedMotion;

        // Cognitive accessibility
        this.settingsPanel.querySelector('#simplified-interface').checked = settings.cognitiveAccessibility.simplifiedInterface;
        this.settingsPanel.querySelector('#confirm-actions').checked = settings.cognitiveAccessibility.confirmActions;
        this.settingsPanel.querySelector('#contextual-help').checked = settings.cognitiveAccessibility.contextualHelp;
        this.settingsPanel.querySelector('#timeout-warnings').checked = settings.cognitiveAccessibility.timeoutWarnings;
        this.settingsPanel.querySelector('#dyslexia-support').checked = settings.cognitiveAccessibility.dyslexiaSupport;

        // Visual accessibility
        this.settingsPanel.querySelector('#high-contrast').checked = settings.visualAccessibility.highContrast;
        this.settingsPanel.querySelector('#large-text').checked = settings.visualAccessibility.largeText;
        this.settingsPanel.querySelector('#font-size').value = settings.visualAccessibility.fontSize;
        this.settingsPanel.querySelector('#font-size-value').textContent = `${settings.visualAccessibility.fontSize}px`;
        this.settingsPanel.querySelector('#colorblind-support').checked = settings.visualAccessibility.colorBlindnessSupport;
        this.settingsPanel.querySelector('#reduced-transparency').checked = settings.visualAccessibility.reducedTransparency;

        // Audio accessibility
        this.settingsPanel.querySelector('#haptic-feedback').checked = settings.audioAccessibility.hapticFeedback;
        this.settingsPanel.querySelector('#visual-indicators').checked = settings.audioAccessibility.visualIndicators;
        this.settingsPanel.querySelector('#sound-enabled').checked = settings.audioAccessibility.soundEnabled;

        // Voice control
        this.settingsPanel.querySelector('#voice-control').checked = settings.voiceControl.enabled;
        this.settingsPanel.querySelector('#voice-confidence').value = settings.voiceControl.confidence;
        this.settingsPanel.querySelector('#voice-confidence-value').textContent = `${Math.round(settings.voiceControl.confidence * 100)}%`;

        // Show/hide dwell time container
        const dwellTimeContainer = this.settingsPanel.querySelector('#dwell-time-container');
        dwellTimeContainer.classList.toggle('visible', settings.motorAccessibility.dwellControl);
        } catch (error) {
            console.error('❌ Error loading accessibility settings:', error);
            // Use default settings as fallback
            const settings = this.defaultSettings;

            // Load defaults into panel
            this.settingsPanel.querySelector('#dwell-control').checked = settings.motorAccessibility.dwellControl;
            this.settingsPanel.querySelector('#dwell-time').value = settings.motorAccessibility.dwellTime;
            this.settingsPanel.querySelector('#dwell-time-value').textContent = `${settings.motorAccessibility.dwellTime}ms`;
            this.settingsPanel.querySelector('#large-targets').checked = settings.motorAccessibility.largeTargets;
            this.settingsPanel.querySelector('#sticky-keys').checked = settings.motorAccessibility.stickyKeys;
            this.settingsPanel.querySelector('#reduced-motion').checked = settings.motorAccessibility.reducedMotion;
        }
    }

    /**
     * Get current settings from accessibility manager
     *
     * @method getCurrentSettings
     * @returns {Object} Current accessibility settings
     * @private
     */
    getCurrentSettings() {
        // Ensure accessibility manager is properly initialized
        if (!this.accessibilityManager) {
            console.warn('⚠️ Accessibility manager not initialized, using default settings');
            return this.defaultSettings;
        }

        // Safely access properties with fallbacks
        return {
            motorAccessibility: this.accessibilityManager.motorAccessibility || this.defaultSettings.motorAccessibility,
            cognitiveAccessibility: this.accessibilityManager.cognitiveAccessibility || this.defaultSettings.cognitiveAccessibility,
            visualAccessibility: this.accessibilityManager.visualAccessibility || this.defaultSettings.visualAccessibility,
            audioAccessibility: this.accessibilityManager.audioAccessibility || this.defaultSettings.audioAccessibility,
            voiceControl: {
                enabled: this.accessibilityManager.voiceControl?.enabled || this.defaultSettings.voiceControl.enabled,
                confidence: this.accessibilityManager.voiceControl?.confidence || this.defaultSettings.voiceControl.confidence
            }
        };
    }

    /**
     * Save settings and apply changes
     *
     * @method saveSettings
     * @returns {void}
     */
    saveSettings() {
        const newSettings = this.getSettingsFromPanel();
        this.applySettings(newSettings);
        this.persistSettings(newSettings);
        this.hideSettingsPanel();

        this.accessibilityManager.announceToScreenReader('Accessibility settings saved and applied');
    }

    /**
     * Get settings values from panel inputs
     *
     * @method getSettingsFromPanel
     * @returns {Object} Settings object from panel
     * @private
     */
    getSettingsFromPanel() {
        return {
            motorAccessibility: {
                dwellControl: this.settingsPanel.querySelector('#dwell-control').checked,
                dwellTime: parseInt(this.settingsPanel.querySelector('#dwell-time').value, 10),
                largeTargets: this.settingsPanel.querySelector('#large-targets').checked,
                stickyKeys: this.settingsPanel.querySelector('#sticky-keys').checked,
                reducedMotion: this.settingsPanel.querySelector('#reduced-motion').checked
            },
            cognitiveAccessibility: {
                simplifiedInterface: this.settingsPanel.querySelector('#simplified-interface').checked,
                confirmActions: this.settingsPanel.querySelector('#confirm-actions').checked,
                contextualHelp: this.settingsPanel.querySelector('#contextual-help').checked,
                timeoutWarnings: this.settingsPanel.querySelector('#timeout-warnings').checked,
                dyslexiaSupport: this.settingsPanel.querySelector('#dyslexia-support').checked
            },
            visualAccessibility: {
                highContrast: this.settingsPanel.querySelector('#high-contrast').checked,
                largeText: this.settingsPanel.querySelector('#large-text').checked,
                fontSize: parseInt(this.settingsPanel.querySelector('#font-size').value, 10),
                colorBlindnessSupport: this.settingsPanel.querySelector('#colorblind-support').checked,
                reducedTransparency: this.settingsPanel.querySelector('#reduced-transparency').checked
            },
            audioAccessibility: {
                hapticFeedback: this.settingsPanel.querySelector('#haptic-feedback').checked,
                visualIndicators: this.settingsPanel.querySelector('#visual-indicators').checked,
                soundEnabled: this.settingsPanel.querySelector('#sound-enabled').checked
            },
            voiceControl: {
                enabled: this.settingsPanel.querySelector('#voice-control').checked,
                confidence: parseFloat(this.settingsPanel.querySelector('#voice-confidence').value)
            }
        };
    }

    /**
     * Apply settings to accessibility manager
     *
     * @method applySettings
     * @param {Object} settings - Settings to apply
     * @returns {void}
     * @private
     */
    applySettings(settings) {
        // Update accessibility manager settings
        Object.assign(this.accessibilityManager.motorAccessibility, settings.motorAccessibility);
        Object.assign(this.accessibilityManager.cognitiveAccessibility, settings.cognitiveAccessibility);
        Object.assign(this.accessibilityManager.visualAccessibility, settings.visualAccessibility);
        Object.assign(this.accessibilityManager.audioAccessibility, settings.audioAccessibility);
        Object.assign(this.accessibilityManager.voiceControl, settings.voiceControl);

        // Apply visual changes
        this.applyVisualSettings(settings.visualAccessibility);
        this.applyMotorSettings(settings.motorAccessibility);
        this.applyCognitiveSettings(settings.cognitiveAccessibility);
        this.applyVoiceControlSettings(settings.voiceControl);
    }

    /**
     * Apply visual accessibility settings
     *
     * @method applyVisualSettings
     * @param {Object} visualSettings - Visual accessibility settings
     * @returns {void}
     * @private
     */
    applyVisualSettings(visualSettings) {
        const html = document.documentElement;

        html.classList.toggle('high-contrast', visualSettings.highContrast);
        html.classList.toggle('large-text', visualSettings.largeText);
        html.classList.toggle('colorblind-support', visualSettings.colorBlindnessSupport);
        html.classList.toggle('reduced-transparency', visualSettings.reducedTransparency);

        if (visualSettings.fontSize !== 16) {
            html.style.fontSize = `${visualSettings.fontSize}px`;
        }
    }

    /**
     * Apply motor accessibility settings
     *
     * @method applyMotorSettings
     * @param {Object} motorSettings - Motor accessibility settings
     * @returns {void}
     * @private
     */
    applyMotorSettings(motorSettings) {
        const html = document.documentElement;

        html.classList.toggle('large-targets', motorSettings.largeTargets);
        html.classList.toggle('reduced-motion', motorSettings.reducedMotion);
    }

    /**
     * Apply cognitive accessibility settings
     *
     * @method applyCognitiveSettings
     * @param {Object} cognitiveSettings - Cognitive accessibility settings
     * @returns {void}
     * @private
     */
    applyCognitiveSettings(cognitiveSettings) {
        const html = document.documentElement;

        html.classList.toggle('simplified-interface', cognitiveSettings.simplifiedInterface);
        html.classList.toggle('dyslexia-support', cognitiveSettings.dyslexiaSupport);
    }

    /**
     * Apply voice control settings
     *
     * @method applyVoiceControlSettings
     * @param {Object} voiceSettings - Voice control settings
     * @returns {void}
     * @private
     */
    applyVoiceControlSettings(voiceSettings) {
        if (this.accessibilityManager.toggleVoiceControl) {
            this.accessibilityManager.toggleVoiceControl(voiceSettings.enabled);
        }
    }

    /**
     * Reset settings to defaults
     *
     * @method resetSettings
     * @returns {void}
     */
    resetSettings() {
        if (confirm('Are you sure you want to reset all accessibility settings to defaults?')) {
            this.applySettings(this.defaultSettings);
            this.persistSettings(this.defaultSettings);
            this.loadCurrentSettings();

            this.accessibilityManager.announceToScreenReader('Accessibility settings reset to defaults');
        }
    }

    /**
     * Load settings from localStorage
     *
     * @method loadSettings
     * @returns {void}
     * @private
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('calculator-accessibility-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.applySettings(settings);
            }
        } catch (error) {
            console.warn('Failed to load accessibility settings:', error);
        }
    }

    /**
     * Persist settings to localStorage
     *
     * @method persistSettings
     * @param {Object} settings - Settings to persist
     * @returns {void}
     * @private
     */
    persistSettings(settings) {
        try {
            localStorage.setItem('calculator-accessibility-settings', JSON.stringify(settings));
        } catch (error) {
            console.warn('Failed to save accessibility settings:', error);
        }
    }

    /**
     * Check if voice control is supported
     *
     * @method checkVoiceControlSupport
     * @returns {boolean} Whether voice control is supported
     * @private
     */
    checkVoiceControlSupport() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }
}

// ------------ MODULE EXPORTS

export default AccessibilitySettings;
