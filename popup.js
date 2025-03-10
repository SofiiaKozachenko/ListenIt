document.addEventListener("DOMContentLoaded", () => {
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
    let voices = []; // Зберігаємо голоси тут
window.addEventListener('load', () => {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const instructionsMessage = document.getElementById('instructionsMessage');
        speak(welcomeMessage.innerText);
        speak(instructionsMessage.innerText);
    });
    function populateVoices() {
        voices = speechSynthesis.getVoices(); // Отримуємо голоси тут
        voiceList.innerHTML = "";

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

        if (voices.length > 0) {
            if (selectedVoice) {
                const foundVoice = voices.find(voice => voice.name === selectedVoice);
                if (foundVoice) {
                    voiceBtn.textContent = `${foundVoice.name} (${foundVoice.lang})`;
                } else {
                    voiceBtn.textContent = `${voices[0].name} (${voices[0].lang})`;
                    selectedVoice = voices[0].name;
                }
            } else {
                voiceBtn.textContent = `${voices[0].name} (${voices[0].lang})`;
                selectedVoice = voices[0].name;
            }
        }
    }

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

    function testVoice() {
        const utterance = new SpeechSynthesisUtterance("Це тестовий текст для перевірки голосу.");
        utterance.voice = voices.find(voice => voice.name === selectedVoice) ?? null;
        utterance.rate = parseFloat(speechRateInput.value) || 1;
        utterance.pitch = parseFloat(speechPitchInput.value) || 1;
        speechSynthesis.speak(utterance);
    }

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

    stopSpeechButton?.addEventListener("click", () => {
        speechSynthesis.cancel();
    });

    function updateNumberInput(slider, numberInput) {
        numberInput.value = slider.value;
    }

    function updateSlider(numberInput, slider) {
        slider.value = numberInput.value;
    }

    speechRateSlider.addEventListener("input", () => {
        updateNumberInput(speechRateSlider, speechRateInput);
        testVoice();
    });

    speechRateInput.addEventListener("change", () => {
        updateSlider(speechRateInput, speechRateSlider);
        testVoice();
    });

    speechPitchSlider.addEventListener("input", () => {
        updateNumberInput(speechPitchSlider, speechPitchInput);
        testVoice();
    });

    speechPitchInput.addEventListener("change", () => {
        updateSlider(speechPitchInput, speechPitchSlider);
        testVoice();
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

    loadSettings();
});