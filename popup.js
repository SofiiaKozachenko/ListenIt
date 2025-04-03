class UiManager {
    constructor(speechManager) {
        this.speechManager = speechManager;

        this.speechRateInput = document.getElementById("speechRate");
        this.speechRateSlider = document.getElementById("speechRate2");
        this.speechPitchInput = document.getElementById("speechPitch");
        this.speechPitchSlider = document.getElementById("toneRate");
        this.closeButton = document.getElementById('cross');
        this.init();
    }

    init() {
        this.addEventListeners();
        this.loadSettings();
    }

    updateNumberInput(slider, numberInput) {
        numberInput.value = slider.value;
    }

    updateSlider(numberInput, slider) {
        slider.value = numberInput.value;
    }

    addEventListeners() {
        this.speechRateSlider.addEventListener("input", () => {
            this.updateNumberInput(this.speechRateSlider, this.speechRateInput);
            this.testVoice();
        });

        this.speechRateInput.addEventListener("change", () => {
            this.updateSlider(this.speechRateInput, this.speechRateSlider);
            this.testVoice();
        });

        this.speechPitchSlider.addEventListener("input", () => {
            this.updateNumberInput(this.speechPitchSlider, this.speechPitchInput);
            this.testVoice();
        });

        this.speechPitchInput.addEventListener("change", () => {
            this.updateSlider(this.speechPitchInput, this.speechPitchSlider);
            this.testVoice();
        });

        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                window.close();
            });
        }
    }

    loadSettings() {
        chrome.storage.sync.get("settings", (data) => {
            const settings = data.settings || {};
            this.speechRateInput.value = settings.speechRate || 1;
            this.speechPitchInput.value = settings.speechPitch || 1;
            this.speechRateSlider.value = settings.speechRate || 1;
            this.speechPitchSlider.value = settings.speechPitch || 1;
            this.testVoice();
        });
    }

    testVoice() {
        const rate = parseFloat(this.speechRateInput.value) || 1;
        const pitch = parseFloat(this.speechPitchInput.value) || 1;
        this.speechManager.speak("Це тестовий текст для перевірки голосу.");
        this.rate = rate;
        this.pitch = pitch;

    }
}

class SpeechManager {
    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.voices = [];
        this.selectedVoice = null;
        this.loadVoices();
    }

    loadVoices() {
        this.voices = this.speechSynthesis.getVoices();
        this.selectedVoice = this.voices[0];
    }

    speak(text) {
        if (!text.trim()) {
            console.error("Текст для озвучення порожній.");
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.selectedVoice || this.voices[0];
        utterance.lang = "uk-UA";
        utterance.rate = 1;
        utterance.pitch = 1;
        this.speechSynthesis.speak(utterance);
    }

    stopSpeech() {
        this.speechSynthesis.cancel();
    }

    getVoices() {
        return this.voices;
    }

    setSelectedVoice(voice) {
        this.selectedVoice = voice;
    }

    setVoiceSettings(rate, pitch) {
        if (this.currentUtterance) {
            this.currentUtterance.rate = rate;
            this.currentUtterance.pitch = pitch;
        }
    }
}

class SettingManager {
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

            // Оновлюємо лише ті параметри, що змінюються
            const updatedSettings = {
                ...currentSettings,
                ...newSettings,
                mode: currentSettings.mode || "default"  // НЕ перезаписуємо mode
            };

            chrome.storage.sync.set({ settings: updatedSettings }, () => {
                console.log("Збережені налаштування:", updatedSettings);
                alert("Налаштування збережено!");
            });
        });
    }

}


class ModeManager {
    constructor(speechManager) {
        this.speechManager = speechManager;

        this.mode = 'tab';
    }

    getMode() {
        return this.mode;
    }

    activateHoverMode() {
        this.mode = 'hover';
        this.applyMode();
    }

    activateFullPageMode() {
        this.mode = 'readPage';
        this.applyMode();
    }

    activateSelectedTextMode() {
        this.mode = 'selection';
        this.applyMode();
    }

    applyMode() {
        chrome.storage.sync.get("settings", (data) => {
            const settings = data.settings || {};
            settings.mode = this.mode; // Оновлюємо тільки режим

            chrome.storage.sync.set({ settings }, () => {
                console.log(`Режим змінено на: ${this.mode}`);
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs && tabs.length > 0) {
                        chrome.tabs.reload(tabs[0].id);
                    }
                });
            });
        });
    }

}

document.addEventListener("DOMContentLoaded", () => {
    const speechManager = new SpeechManager();

    const uiManager = new UiManager(speechManager);
    const settingManager = new SettingManager(uiManager, speechManager);
    const modeManager = new ModeManager(speechManager);

    const hoverModeButton = document.getElementById("hoverMode");
    const readPageModeButton = document.getElementById("readPageMode");
    const selectionModeButton = document.getElementById("selectionMode");
    const ignoreAdsCheckbox = document.getElementById("ignoreAds");
    const voiceBtn = document.getElementById("voice-btn");
    const voiceList = document.getElementById("voice-list");
    const saveSettingsButton = document.getElementById("saveSettings");
    const stopSpeechButton = document.getElementById("stopSpeech");

    let selectedVoice = null;
    let voices = [];

    function populateVoices() {
        voices = speechSynthesis.getVoices();
        voiceList.innerHTML = "";
        voiceBtn.textContent = "Оберіть голос";

        voices.forEach(voice => {
            const voiceItem = document.createElement("div");
            voiceItem.innerHTML = `${voice.name} (${voice.lang})`;

            voiceItem.classList.add("dropdown-item");
            voiceItem.addEventListener("click", () => {
                voiceBtn.textContent = `${voice.name} (${voice.lang})`;
                selectedVoice = voice.name;
                voiceList.classList.remove("show");
                uiManager.testVoice();
            });
            voiceList.appendChild(voiceItem);
        });

        if (voices.length > 0 && !selectedVoice) {
            selectedVoice = voices[0].name;
        }
    }

    function testVoice() {
        const utterance = new SpeechSynthesisUtterance("Це тестовий текст для перевірки голосу.");
        utterance.voice = voices.find(voice => voice.name === selectedVoice) ?? null;
        utterance.rate = parseFloat(uiManager.speechRateInput.value) || 1;
        utterance.pitch = parseFloat(uiManager.speechPitchInput.value) || 1;
        speechSynthesis.speak(utterance);
    }

    window.addEventListener('load', () => {
        populateVoices();
        settingManager.loadSettings();

        setTimeout(() => {
            console.log("Trying to speak...");
            const welcomeMessage = document.getElementById('welcomeMessage');
            const instructionsMessage = document.getElementById('instructionsMessage');

            if (!instructionsMessage || !welcomeMessage) {
                console.error("Element not found!");
                return;
            }

            speechManager.speak(welcomeMessage.innerText);
            speechManager.speak(instructionsMessage.innerText);
        }, 1000);
    });

    voiceBtn.addEventListener("click", () => {
        voiceList.classList.toggle("show");
    });

    window.addEventListener("click", (event) => {
        if (!event.target.matches(".dropdown-btn")) {
            if (voiceList.classList.contains("show")) {
                voiceList.classList.remove("show");
            }
        }
    });

    function loadSettings() {
        chrome.storage.sync.get("settings", (data) => {
            const settings = data.settings || {};

            if (settings.mode === 'hoverMode') {
                hoverModeButton.classList.add('active');
                readPageModeButton.classList.remove('active');
                selectionModeButton.classList.remove('active');
            } else if (settings.mode === 'readPageMode') {
                readPageModeButton.classList.add('active');
                hoverModeButton.classList.remove('active');
                selectionModeButton.classList.remove('active');
            } else if (settings.mode === 'selectionMode') {
                selectionModeButton.classList.add('active');
                hoverModeButton.classList.remove('active');
                readPageModeButton.classList.remove('active');
            } else {
                hoverModeButton.classList.remove('active');
                readPageModeButton.classList.remove('active');
                selectionModeButton.classList.remove('active');
            }

            ignoreAdsCheckbox.checked = settings.ignoreAds || false;
            uiManager.speechRateInput.value = settings.speechRate || 1;
            uiManager.speechPitchInput.value = settings.speechPitch || 1;
            uiManager.speechRateSlider.value = settings.speechRate || 1;
            uiManager.speechPitchSlider.value = settings.speechPitch || 1;
            selectedVoice = settings.selectedVoice || null;

            if (speechSynthesis.getVoices().length > 0) {
                populateVoices();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    populateVoices();
                };
            }
        });
    }

    saveSettingsButton?.addEventListener("click", () => {
        const activeButton = document.querySelector('.button-style.active');
        const mode = activeButton ? activeButton.id.replace('Mode', '') : 'tab';

        const settings = {
            mode: mode,
            ignoreAds: ignoreAdsCheckbox?.checked ?? false,
            selectedVoice: selectedVoice,
            speechRate: parseFloat(uiManager.speechRateInput?.value) || 1,
            speechPitch: parseFloat(uiManager.speechPitchInput?.value) || 1,
        };

        settingManager.saveSettings(settings);

        document.querySelectorAll('.button-style').forEach(button => {
            if (button.id.replace('Mode', '') === settings.mode) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        loadSettings();
        saveSettingsButton?.addEventListener("click", () => {
            // Отримуємо ID поточного вікна розширення та закриваємо його
            chrome.windows.getCurrent((window) => {
                if (window && window.id) {
                    chrome.windows.remove(window.id);
                }
            });
        });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    });

    stopSpeechButton?.addEventListener("click", () => {
        speechManager.stopSpeech();
    });


    document.getElementById("hoverMode").addEventListener("click", () => {
        modeManager.activateHoverMode();
    });

    document.getElementById("readPageMode").addEventListener("click", () => {
        modeManager.activateFullPageMode();
    });

    document.getElementById("selectionMode").addEventListener("click", () => {
        modeManager.activateSelectedTextMode();
    });

    document.getElementById("hoverMode").addEventListener("focus", () => {
        speechManager.speak("Режим читання наведенням мишки");
    });

    document.getElementById("readPageMode").addEventListener("focus", () => {
        speechManager.speak("Режим читання всього тексту");
    });

    document.getElementById("selectionMode").addEventListener("focus", () => {
        speechManager.speak("Режим читання виділеного тексту");
    });

    document.getElementById("stopSpeech").addEventListener("focus", () => {
        speechManager.speak("Кнопка для зупинки озвучення");
    });

    loadSettings();
});