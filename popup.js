document.addEventListener("DOMContentLoaded", () => {
  const hoverModeCheckbox = document.getElementById("hoverMode");
  const autoDetectLanguageCheckbox = document.getElementById("autoDetectLanguage");
  const voiceSelect = document.getElementById("voiceSelect");
  const speechRateInput = document.getElementById("speechRate");
  const saveSettingsButton = document.getElementById("saveSettings");
  const stopSpeechButton = document.getElementById("stopSpeech");

  // Завантаження голосів
  function populateVoices() {
    const voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = voices
      .map(voice => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`)
      .join("");
  }

  // Завантаження збережених налаштувань
  function loadSettings() {
    chrome.storage.sync.get("settings", (data) => {
      const settings = data.settings || {};

      // Встановлення значень у UI
      hoverModeCheckbox.checked = settings.hoverMode || false;
      autoDetectLanguageCheckbox.checked = settings.autoDetectLanguage || false;
      speechRateInput.value = settings.speechRate || 1;

      // Встановлення обраного голосу
      const voices = speechSynthesis.getVoices();
      if (settings.selectedVoice) {
        const selectedVoice = voices.find(voice => voice.name === settings.selectedVoice);
        if (selectedVoice) {
          voiceSelect.value = selectedVoice.name;
        }
      }
    });
  }

  // Озвучення тестового тексту при зміні голосу
  function testVoice() {
    const selectedVoiceName = voiceSelect.value;
    const testText = "Це тестовий текст для перевірки голосу.";
    const utterance = new SpeechSynthesisUtterance(testText);

    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.name === selectedVoiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = parseFloat(speechRateInput.value) || 1;

    speechSynthesis.speak(utterance);
  }

  // Зупинка озвучення
  stopSpeechButton.addEventListener("click", () => {
    speechSynthesis.cancel(); // Зупиняє всі поточні озвучення
  });

  // Збереження налаштувань
  saveSettingsButton.addEventListener("click", () => {
    const settings = {
      hoverMode: hoverModeCheckbox.checked,
      autoDetectLanguage: autoDetectLanguageCheckbox.checked,
      selectedVoice: voiceSelect.value,
      speechRate: parseFloat(speechRateInput.value),
    };

    chrome.storage.sync.set({ settings }, () => {
      alert("Налаштування збережено!");
    });
  });

  // Прив'язка події зміни голосу
  voiceSelect.addEventListener("change", testVoice);

  // Завантаження голосів при ініціалізації
  populateVoices();
  speechSynthesis.onvoiceschanged = populateVoices;

  // Завантаження налаштувань при відкритті popup
  loadSettings();
});

