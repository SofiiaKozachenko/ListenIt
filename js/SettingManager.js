export default class SettingManager {
    constructor(uiManager, speechManager) {
        this.uiManager = uiManager;
        this.speechManager = speechManager;

        this.loadSettings();
    }

    loadSettings() {
        chrome.storage.sync.get("settings", (data) => {
            const settings = data.settings || {};

            // Перевіряємо чи передано якісь значення, інакше залишаємо попередні
            if (settings.selectedVoice) {
                this.updateVoice(settings.selectedVoice);
            }
            if (settings.speechRate !== undefined) {
                this.updateSpeechRate(settings.speechRate);
            }
            if (settings.speechPitch !== undefined) {
                this.updateSpeechPitch(settings.speechPitch);
            }
            if (settings.ignoreAds !== undefined) {
                this.updateIgnoreAds(settings.ignoreAds);
            }

            // Додай цю перевірку, щоб не збивати `mode`
            if (settings.mode) {
                chrome.storage.local.set({ currentMode: settings.mode }); // (для debug або можливого відображення)
            }

            this.uiManager.loadSettings(); // вже підтягує потрібні UI елементи
        });
    }

    updateMode(mode) {
        // Передаємо в modeManager (якщо потрібно)
        if (this.uiManager?.modeManager?.setMode) {
            this.uiManager.modeManager.setMode(mode);
        }
    }

    updateVoice(voiceName) {
        const voices = this.speechManager.getVoices();
        const selectedVoice = voices.find(voice => voice.name === voiceName);
        if (selectedVoice) {
            this.speechManager.setSelectedVoice(selectedVoice);
        }
    }

    updateSpeechRate(rate) {
        this.speechManager.setVoiceSettings(rate, this.speechManager.currentPitch);
    }

    updateSpeechPitch(pitch) {
        this.speechManager.setVoiceSettings(this.speechManager.currentRate, pitch);
    }

    updateIgnoreAds(ignoreAds) {
        chrome.storage.sync.get("settings", (data) => {
            const currentSettings = data.settings || {};
            const updatedSettings = {
                ...currentSettings,
                ignoreAds: ignoreAds, // Correctly update ignoreAds here
                mode: currentSettings.mode || "default"
            };
    
            chrome.storage.sync.set({ settings: updatedSettings }, () => {
                console.log("Updated settings:", updatedSettings);
            });
        });
    }
    
    saveSettings(newSettings) {
        return new Promise((resolve) => {
            chrome.storage.sync.get("settings", (data) => {
                const currentSettings = data.settings || {};
                const updatedSettings = {
                    ...currentSettings,
                    ...newSettings
                };
                chrome.storage.sync.set({ settings: updatedSettings }, () => {
                    console.log("✅ Збережено налаштування:", updatedSettings);
                    resolve(updatedSettings);
                });
            });
        });
    }



}

window.SettingManager = SettingManager;