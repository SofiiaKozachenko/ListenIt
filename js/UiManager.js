export default class UiManager {
    constructor(speechManager, modeManager) {
        this.speechManager = speechManager;
        this.modeManager = modeManager;

        this.speechRateInput = document.getElementById("speechRate");
        this.speechRateSlider = document.getElementById("speechRate2");
        this.speechPitchInput = document.getElementById("speechPitch");
        this.speechPitchSlider = document.getElementById("toneRate");
        this.closeButton = document.getElementById('cross');
        this.hoverModeButton = document.getElementById("hoverMode");
        this.readPageModeButton = document.getElementById("readPageMode");
        this.selectionModeButton = document.getElementById("selectionMode");
        this.stopSpeechButton = document.getElementById("stopSpeech");

        this.init();
    }

    init() {
        if (!this.modeManager) {
            console.error("modeManager is not defined");
            return;
        }
        this.addEventListeners();
        this.loadSettings();
    }

    addEventListeners() {
        this.hoverModeButton.addEventListener("click", () => {
            this.modeManager.activateHoverMode();
        });

        this.readPageModeButton.addEventListener("click", () => {
            this.modeManager.activateFullPageMode();
        });

        this.selectionModeButton.addEventListener("click", () => {
            this.modeManager.activateSelectedTextMode();
        });

        this.hoverModeButton.addEventListener("focus", () => {
            this.speechManager.speak("Режим читання наведенням мишки");
        });

        this.readPageModeButton.addEventListener("focus", () => {
            this.speechManager.speak("Режим читання всього тексту");
        });

        this.selectionModeButton.addEventListener("focus", () => {
            this.speechManager.speak("Режим читання виділеного тексту");
        });

        this.stopSpeechButton.addEventListener("focus", () => {
            this.speechManager.speak("Кнопка для зупинки озвучення");
        });

        this.speechRateSlider.addEventListener("input", () => {
            this.updateNumberInput(this.speechRateSlider, this.speechRateInput);
            this.speechManager.testVoice(parseFloat(this.speechRateInput.value) || 1, parseFloat(this.speechPitchInput.value) || 1);
        });

        this.speechRateInput.addEventListener("change", () => {
            this.updateSlider(this.speechRateInput, this.speechRateSlider);
            this.speechManager.testVoice(parseFloat(this.speechRateInput.value) || 1, parseFloat(this.speechPitchInput.value) || 1);
        });

        this.speechPitchSlider.addEventListener("input", () => {
            this.updateNumberInput(this.speechPitchSlider, this.speechPitchInput);
            this.speechManager.testVoice(parseFloat(this.speechRateInput.value) || 1, parseFloat(this.speechPitchInput.value) || 1);
        });

        this.speechPitchInput.addEventListener("change", () => {
            this.updateSlider(this.speechPitchInput, this.speechPitchSlider);
            this.speechManager.testVoice(parseFloat(this.speechRateInput.value) || 1, parseFloat(this.speechPitchInput.value) || 1);
        });

        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                window.close();
            });
        }
    }

    updateNumberInput(slider, numberInput) {
        numberInput.value = slider.value;
    }

    updateSlider(numberInput, slider) {
        slider.value = numberInput.value;
    }

    setActiveButton(activeButton) {
        const buttons = document.querySelectorAll('.button-style');
        buttons.forEach(button => button.classList.remove('active'));
    
        activeButton.classList.add('active');
    }

    loadSettings() {
        chrome.storage.sync.get("settings", (data) => {
            const settings = data.settings || {};
            this.speechRateInput.value = settings.speechRate || 1;
            this.speechPitchInput.value = settings.speechPitch || 1;
            this.speechRateSlider.value = settings.speechRate || 1;
            this.speechPitchSlider.value = settings.speechPitch || 1;
        });
    }
}