document.addEventListener('DOMContentLoaded', function () {
    const speechSynthesis = window.speechSynthesis;
    const voiceBtn = document.getElementById("voice-btn");
    const voiceList = document.getElementById("voice-list");
    const speechRateInput = document.getElementById("speechRate");
    const speechInput = document.getElementById("speedInput");
    const toneRateInput = document.getElementById("toneRate");
    const toneInput = document.getElementById("toneInput");
    const applyButton = document.getElementById('applyButton');
    const ignoreAdsCheckbox = document.getElementById('ignoreAds');
    const hoverModeBtn = document.getElementById("hoverModeBtn");
    const fullPageModeBtn = document.getElementById("fullPageMode");
    const selectedTextModeBtn = document.getElementById("selectedTextMode");
    const stopButton = document.getElementById('stopMode');

    let voices = [];
    let selectedVoice = null;
    let isSpeaking = false;

    window.addEventListener('load', () => {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const instructionsMessage = document.getElementById('instructionsMessage');
        speak(welcomeMessage.innerText);
        speak(instructionsMessage.innerText);
    });

    function loadVoices() {
        voices = speechSynthesis.getVoices();
        voiceList.innerHTML = "";
        voiceBtn.textContent = "Оберіть голос";

        voices.forEach((voice, index) => {
            const voiceOption = document.createElement("div");
            voiceOption.textContent = `${voice.name} (${voice.lang})`;
            voiceOption.dataset.value = voice.name;
            voiceOption.classList.add("dropdown-item");

            voiceOption.addEventListener("click", () => {
                selectedVoice = voice.name;
                voiceBtn.textContent = voiceOption.textContent;
            });

            voiceList.appendChild(voiceOption);
        });
    }

    function updateVoiceSettings() {
        if (selectedVoice) {
          const selected = voices.find(voice => voice.name === selectedVoice);
         
        if (selected) {
            speechSynthesis.voice = selected;
        } else {
            console.warn(`Обраний голос '${selectedVoice}' не знайдено. Використовується стандартний.`);
        }
    }
        const rate = parseFloat(speechInput.value);
        const pitch = parseFloat(toneInput.value);

        if (!isNaN(rate) && rate >= 0.1 && rate <= 2) {
            speechSynthesis.rate = rate;
        }

        if (!isNaN(pitch) && pitch >= 0 && pitch <= 2) {
            speechSynthesis.pitch = pitch;
        }

        chrome.storage.sync.set({
        settings: {
            selectedVoice: selectedVoice,
            speechRate: rate,
            toneRate: pitch
        }
    }, () => {
        console.log("Налаштування голосу збережено:", { selectedVoice, rate, pitch });
    });
}

    function speak(text) {
        if (isSpeaking) return;

        isSpeaking = true;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = speechSynthesis.voice || voices[0];
        utterance.rate = parseFloat(speechInput.value);
        utterance.pitch = parseFloat(toneInput.value);

        utterance.onend = () => {
            isSpeaking = false;
        };

        speechSynthesis.speak(utterance);
    }

    function checkForAdsAndIgnore() {
        if (ignoreAdsCheckbox.checked) {
            const ads = document.querySelectorAll('.ad, .advertisement, .ads');
            ads.forEach(ad => ad.style.display = 'none');
        }
    }

    applyButton.addEventListener('click', function () {
        updateVoiceSettings();
        checkForAdsAndIgnore();
        alert(`Застосовано зміни`);
        const exampleText = "Текст для перевірки швидкості, тембру та голосу!";
        speak(exampleText);
    });

    function saveModeSettings(selectedMode) {
        chrome.storage.sync.set({ settings: { mode: selectedMode } }, () => {
            console.log("Режим збережено:", { mode: selectedMode });
            highlightActiveMode(selectedMode);
            alert(`Режим змінено на: ${getModeName(selectedMode)}`);

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    chrome.tabs.sendMessage(tabs[0].id, { mode: selectedMode });
                }
            });
        });
    }

    function highlightActiveMode(activeMode) {
        document.querySelectorAll(".button-style").forEach(btn => {
            btn.classList.remove("active-mode");
        });

        const activeButton = document.getElementById(activeMode);
        if (activeButton) {
            activeButton.classList.add("active-mode");
        }
    }

    function getModeName(modeId) {
        switch (modeId) {
            case "hoverModeBtn": return "При наведенні мишки";
            case "fullPageMode": return "Весь вміст сторінки";
            case "selectedTextMode": return "Виділений текст";
            default: return "Невідомий режим";
        }
    }

    hoverModeBtn.addEventListener("click", () => saveModeSettings("hoverModeBtn"));
    fullPageModeBtn.addEventListener("click", () => saveModeSettings("fullPageMode"));
    selectedTextModeBtn.addEventListener("click", () => saveModeSettings("selectedTextMode"));

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    speechSynthesis.rate = 1;
    speechSynthesis.pitch = 1;

    function syncInputs(input, output) {
        output.value = input.value;
    }

    speechRateInput.addEventListener("input", () => syncInputs(speechRateInput, speechInput));
    toneRateInput.addEventListener("input", () => syncInputs(toneRateInput, toneInput));
    speechInput.addEventListener("input", () => syncInputs(speechInput, speechRateInput));
    toneInput.addEventListener("input", () => syncInputs(toneInput, toneRateInput));

    voiceBtn.addEventListener("click", () => voiceList.classList.toggle("show"));

    document.addEventListener("click", (e) => {
        if (!voiceBtn.contains(e.target) && !voiceList.contains(e.target)) {
            voiceList.classList.remove("show");
        }
    });

    document.getElementById('cross').addEventListener('click', () => window.close());

    stopButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "stop" });
            }
        });
    });

    chrome.storage.sync.get("settings", (data) => {
    if (data.settings) {
        // Ваш код для обробки налаштувань
        const settings = data.settings;
        selectedVoice = settings.selectedVoice;
        speechInput.value = settings.speechRate || 1;
        toneInput.value = settings.toneRate || 1;
        speechRateInput.value = settings.speechRate || 1;
        toneRateInput.value = settings.toneRate || 1;

        if (selectedVoice) {
            voiceBtn.textContent = voices.find(voice => voice.name === selectedVoice)?.name || "Обрати голос";
        }
        highlightActiveMode(settings.mode || "defaultMode");
    } else {
        // Якщо налаштування не існують, встановіть режим за замовчуванням
        highlightActiveMode("defaultMode");
    }
});
});