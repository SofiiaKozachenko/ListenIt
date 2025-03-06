class SettingManager {
    constructor() {
        this.settings = {};
        this.loadSettings();  // Завантажити налаштування під час ініціалізації
    }

    loadSettings() {
        chrome.storage.sync.get("settings", (data) => {
            this.settings = data.settings || { mode: "defaultMode", ignoreAds: false, selectedVoice: null, speechRate: 2, toneRate: 2 };
            console.log("Налаштування завантажено:", this.settings);
            this.updateActiveMode();  // Оновити активний режим
        });
    }

    saveSettings() {
        chrome.storage.sync.set({ settings: this.settings }, () => {
            console.log("Налаштування збережено:", this.settings);
        });
    }

    getSetting(key) {
        return this.settings[key];
    }

    setSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();  // Зберегти налаштування після оновлення
    }

    updateActiveMode() {
        // Оновлення або виділення активного режиму на сторінці
        const activeMode = this.getSetting("mode");
        if (activeMode) {
            ModeManager.setActiveMode(activeMode);
        }
    }
}

export default SettingManager;