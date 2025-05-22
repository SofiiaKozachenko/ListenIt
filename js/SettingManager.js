export default class SettingManager {
    constructor(uiManager, speechManager) {
        this.uiManager = uiManager;
        this.speechManager = speechManager;
        this.loadSettings();
    }

    loadSettings() {
        chrome.storage.sync.get("settings", (data) => {
            const settings = data.settings || {};
            this.updateVoice(settings.selectedVoice);
            this.updateSpeechRate(settings.speechRate || 1);
            this.updateSpeechPitch(settings.speechPitch || 1);
            this.updateIgnoreAds(settings.ignoreAds || false);
            this.uiManager.loadSettings();
        });
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
        chrome.storage.sync.set({ "ignoreAds": ignoreAds }, () => {
            console.log(`Ігнорування реклами: ${ignoreAds}`);
        });
    }

    saveSettings(newSettings) {
        chrome.storage.sync.get("settings", (data) => {
            const currentSettings = data.settings || {};

            const updatedSettings = {
                ...currentSettings,
                ...newSettings,
                mode: currentSettings.mode || "default" 
            };

            chrome.storage.sync.set({ settings: updatedSettings }, () => {
                console.log("Збережені налаштування:", updatedSettings);
                alert("Налаштування збережено!");
            });
        });
    }
}

window.SettingManager = SettingManager;