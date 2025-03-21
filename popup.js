class UiManager {
    constructor(speechManager) {
        this.speechManager = speechManager; // Залежність від SpeechManager для озвучення

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

    // Функція для оновлення значення в числовому полі на основі слайдера
    updateNumberInput(slider, numberInput) {
        numberInput.value = slider.value;
    }

    // Функція для оновлення значення слайдера на основі числового поля
    updateSlider(numberInput, slider) {
        slider.value = numberInput.value;
    }

    addEventListeners() {
        // Обробник події для слайдера швидкості озвучення
        this.speechRateSlider.addEventListener("input", () => {
            this.updateNumberInput(this.speechRateSlider, this.speechRateInput);
            this.testVoice();
        });

        // Обробник події для зміни значення поля вводу швидкості
        this.speechRateInput.addEventListener("change", () => {
            this.updateSlider(this.speechRateInput, this.speechRateSlider);
            this.testVoice();
        });

        // Обробник події для слайдера висоти тону
        this.speechPitchSlider.addEventListener("input", () => {
            this.updateNumberInput(this.speechPitchSlider, this.speechPitchInput);
            this.testVoice();
        });

        // Обробник події для зміни значення поля вводу висоти тону
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

            // Оновлюємо значення слайдерів і полів вводу згідно з налаштуваннями
            this.speechRateInput.value = settings.speechRate || 1;
            this.speechPitchInput.value = settings.speechPitch || 1;
            this.speechRateSlider.value = settings.speechRate || 1;
            this.speechPitchSlider.value = settings.speechPitch || 1;

            // Тестове озвучення при завантаженні налаштувань
            this.testVoice();
        });
    }

    testVoice() {
        const rate = parseFloat(this.speechRateInput.value) || 1;
        const pitch = parseFloat(this.speechPitchInput.value) || 1;

        this.speechManager.speak("Це тестовий текст для перевірки голосу.");
        this.speechManager.currentUtterance.rate = rate;
        this.speechManager.currentUtterance.pitch = pitch;
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
}

class SettingManager {
    constructor(uiManager, speechManager) {
        this.uiManager = uiManager;
        this.speechManager = speechManager;

        // Завантажуємо налаштування при ініціалізації
        this.loadSettings();
    }

    // Завантаження налаштувань із chrome.storage.sync
    loadSettings() {
        chrome.storage.sync.get("settings", (data) => {
            const settings = data.settings || {};

            // Завантажуємо налаштування для кожного параметра
            this.updateVoice(settings.selectedVoice);
            this.updateSpeechRate(settings.speechRate || 1);
            this.updateSpeechPitch(settings.speechPitch || 1);
            this.updateIgnoreAds(settings.ignoreAds || false);

            // Оновлюємо інтерфейс
            this.uiManager.loadSettings();
        });
    }

    // Оновлення голосу
    updateVoice(voiceName) {
        const voices = this.speechManager.getVoices();
        const selectedVoice = voices.find(voice => voice.name === voiceName);
        if (selectedVoice) {
            this.speechManager.setSelectedVoice(selectedVoice);
        }
    }

    // Оновлення швидкості синтезу мови
    updateSpeechRate(rate) {
        this.speechManager.setVoiceSettings(rate, this.speechManager.currentPitch);
    }

    // Оновлення тембру синтезу мови
    updateSpeechPitch(pitch) {
        this.speechManager.setVoiceSettings(this.speechManager.currentRate, pitch);
    }

    // Оновлення налаштувань ігнорування реклами
    updateIgnoreAds(ignoreAds) {
        chrome.storage.sync.set({ "ignoreAds": ignoreAds }, () => {
            console.log(`Ігнорування реклами: ${ignoreAds}`);
        });
    }

    // Збереження налаштувань
    saveSettings(settings) {
        chrome.storage.sync.set({ settings }, () => {
            console.log("Налаштування збережено:", settings);
            alert("Налаштування збережено!");
        });
    }

    // Оновлення налаштувань в UI
    updateMode(mode) {
        chrome.storage.sync.get("settings", (data) => {
            const settings = data.settings || {};
            settings.mode = mode;
            this.saveSettings(settings);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const uiManager = new UiManager();
    const speechManager = new SpeechManager();
    const settingManager = new SettingManager(uiManager, speechManager);

    const hoverModeButton = document.getElementById("hoverMode");
    const readPageModeButton = document.getElementById("readPageMode");
    const selectionModeButton = document.getElementById("selectionMode");
    const ignoreAdsCheckbox = document.getElementById("ignoreAds");
    const voiceBtn = document.getElementById("voice-btn");
    const voiceList = document.getElementById("voice-list");
    const speechRateInput = document.getElementById("speechRate");
    const speechRateSlider = document.getElementById("speechRate2");
    const speechPitchInput = document.getElementById("speechPitch");
    const speechPitchSlider = document.getElementById("toneRate");
    const saveSettingsButton = document.getElementById("saveSettings");
    const stopSpeechButton = document.getElementById("stopSpeech");
    let selectedVoice = null;
    let voices = [];

    // Функція для заповнення списку голосів
    function populateVoices() {
        voices = speechSynthesis.getVoices(); 
        voiceList.innerHTML = "";
    
        voiceBtn.textContent = "Оберіть голос";
    
        voices.forEach(voice => {
            const voiceItem = document.createElement("div");
            voiceItem.textContent = `${voice.name} (${voice.lang})`;
            voiceItem.classList.add("dropdown-item");
            voiceItem.addEventListener("click", () => {
                voiceBtn.textContent = `${voice.name} (${voice.lang})`;
                selectedVoice = voice.name;
                voiceList.classList.remove("show");
                testVoice();
            });
            voiceList.appendChild(voiceItem);
        });
    
        if (voices.length > 0 && !selectedVoice) {
            selectedVoice = voices[0].name;
        }
    }       

    // Функція для тестування голосу
    function testVoice() {
        const utterance = new SpeechSynthesisUtterance("Це тестовий текст для перевірки голосу.");
        utterance.voice = voices.find(voice => voice.name === selectedVoice) ?? null;
        utterance.rate = parseFloat(speechRateInput.value) || 1;
        utterance.pitch = parseFloat(speechPitchInput.value) || 1;
        speechSynthesis.speak(utterance);
    }

    // Завантаження голосів після завантаження сторінки
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

    // Завантаження налаштувань
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
            speechRateInput.value = settings.speechRate || 1;
            speechPitchInput.value = settings.speechPitch || 1;
            speechRateSlider.value = settings.speechRate || 1;
            speechPitchSlider.value = settings.speechPitch || 1;
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

    // Збереження налаштувань
    saveSettingsButton?.addEventListener("click", () => {
        const activeButton = document.querySelector('.button-style.active');
        const mode = activeButton ? activeButton.id.replace('Mode', '') : 'tab';

        const settings = {
            mode: mode,
            ignoreAds: ignoreAdsCheckbox?.checked ?? false,
            selectedVoice: selectedVoice,
            speechRate: parseFloat(speechRateInput?.value) || 1,
            speechPitch: parseFloat(speechPitchInput?.value) || 1,
        };

        chrome.storage.sync.set({ settings }, () => {
            alert("Налаштування збережено! Режим: " + mode);

            document.querySelectorAll('.button-style').forEach(button => {
                if (button.id.replace('Mode', '') === settings.mode) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });

            loadSettings();
            window.close();
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    chrome.tabs.reload(tabs[0].id);
                }
            });
        });
    });

    // Зупинка озвучення
    stopSpeechButton?.addEventListener("click", () => {
        speechManager.stopSpeech();
    });

    function updateMode(mode) {
        chrome.storage.sync.get("settings", (data) => {
            const settings = data.settings || {};
            settings.mode = mode;
            chrome.storage.sync.set({ settings }, () => {
                loadSettings();
            });
        });
    }

    document.getElementById("hoverMode").addEventListener("click", () => {
        updateMode("hoverMode");
    });

    document.getElementById("readPageMode").addEventListener("click", () => {
        updateMode("readPageMode");
    });

    document.getElementById("selectionMode").addEventListener("click", () => {
        updateMode("selectionMode");
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
