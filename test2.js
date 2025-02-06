document.addEventListener("DOMContentLoaded", function () {
    const voiceBtn = document.getElementById("voice-btn");
    const voiceList = document.getElementById("voice-list");

    function populateVoices() {
        const voices = speechSynthesis.getVoices();

        voiceList.innerHTML = "";
        voices.forEach((voice, index) => {
            const voiceOption = document.createElement("div");
            voiceOption.textContent = `${voice.name} (${voice.lang})`;
            voiceOption.dataset.value = voice.name;
            voiceOption.classList.add("dropdown-item");

            voiceOption.addEventListener("click", function () {
                voiceBtn.textContent = this.textContent;
                voiceList.classList.remove("show");
            });

            voiceList.appendChild(voiceOption);

            // Встановлюємо перший голос як значення кнопки
            if (index === 0) {
                voiceBtn.textContent = `${voice.name} (${voice.lang})`;
            }
        });
    }

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoices;
    } else {
        populateVoices();
    }

    voiceBtn.addEventListener("click", function () {
        voiceList.classList.toggle("show");
    });

    document.addEventListener("click", function (e) {
        if (!voiceBtn.contains(e.target) && !voiceList.contains(e.target)) {
            voiceList.classList.remove("show");
        }
    });
});

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'uk-UA'; 
  speechSynthesis.speak(utterance);
}

document.addEventListener("DOMContentLoaded", () => {
  const voiceSelect = document.getElementById("voice-btn");
  const speechRateInput = document.getElementById("speechRate");
  const speechPitchInput = document.getElementById("toneRate");
  const saveSettingsButton = document.getElementById("applyButton");

  // Функція для заповнення списку голосів
  function populateVoices() {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      voiceSelect.innerHTML = voices
        .map(voice => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`)
        .join("");
    }
  }

  // Завантаження налаштувань
  chrome.storage.sync.get("settings", (data) => {
    const settings = data.settings || {};
    if (settings.selectedVoice) {
      voiceSelect.value = settings.selectedVoice;
    }
    speechRateInput.value = settings.speechRate || 1;
    speechPitchInput.value = settings.speechPitch || 1;
  });

  // Збереження налаштувань
  function saveSettings() {
    const settings = {
      selectedVoice: voiceSelect.value || "",
      speechRate: parseFloat(speechRateInput.value),
      speechPitch: parseFloat(speechPitchInput.value),
    };

    chrome.storage.sync.set({ settings }, () => {
      alert("Налаштування збережено!");
    });
  }

  // Додавання слухача для збереження
  saveSettingsButton.addEventListener("click", saveSettings);
  populateVoices();
  speechSynthesis.onvoiceschanged = populateVoices;
  saveSettings();
});
