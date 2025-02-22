document.addEventListener("DOMContentLoaded", () => {
  const hoverModeCheckbox = document.getElementById("hoverMode");
  const autoDetectLanguageCheckbox = document.getElementById("autoDetectLanguage");
  const voiceSelect = document.getElementById("voiceSelect");
  const speechRateInput = document.getElementById("speechRate");
  const saveSettingsButton = document.getElementById("saveSettings");
  const stopSpeechButton = document.getElementById("stopSpeech");

  let voices = [];

  // ✅ Завантаження голосів із гарантією доступності
  function loadVoices() {
    voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
      speechSynthesis.onvoiceschanged = () => {
        voices = speechSynthesis.getVoices();
        populateVoices();
        loadSettings(); // Завантаження налаштувань після доступу до голосів
      };
    } else {
      populateVoices();
      loadSettings(); // Якщо голоси вже є, можна завантажувати налаштування
    }
  }

  // ✅ Заповнення списку голосів
  function populateVoices() {
    if (!voiceSelect) return;

    voiceSelect.innerHTML = voices
      .map(voice => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`)
      .join("");
  }

  // ✅ Завантаження збережених налаштувань
  function loadSettings() {
  chrome.storage.sync.get("settings", (data) => {
    const settings = data.settings || {};

    hoverModeCheckbox.checked = settings.hoverMode || false;
    autoDetectLanguageCheckbox.checked = settings.autoDetectLanguage || false;
    speechRateInput.value = settings.speechRate || 1;

    const voices = speechSynthesis.getVoices();
    if (settings.selectedVoice) {
      const selectedVoice = voices.find(voice => voice.name === settings.selectedVoice);
      if (selectedVoice) {
        voiceSelect.value = selectedVoice.name;
      }
    }
  });
}


  // ✅ Озвучення тестового тексту при зміні голосу
  function testVoice() {
    const selectedVoiceName = voiceSelect.value;
    const utterance = new SpeechSynthesisUtterance("Це тестовий текст для перевірки голосу.");
    utterance.voice = voices.find(voice => voice.name === selectedVoiceName) ?? null;
    utterance.rate = parseFloat(speechRateInput.value) || 1;
    speechSynthesis.speak(utterance);
  }

  // ✅ Збереження налаштувань
  saveSettingsButton?.addEventListener("click", () => {
    const settings = {
      hoverMode: hoverModeCheckbox?.checked ?? false,
      autoDetectLanguage: autoDetectLanguageCheckbox?.checked ?? false,
      selectedVoice: voiceSelect?.value ?? "",
      speechRate: parseFloat(speechRateInput?.value) || 1,
    };

    chrome.storage.sync.set({ settings }, () => {
      alert("Налаштування збережено!");
    });
  });

  // ✅ Зупинка озвучення
  stopSpeechButton?.addEventListener("click", () => {
    speechSynthesis.cancel();
  });

  // ✅ Тестування голосу при зміні
  voiceSelect?.addEventListener("change", testVoice);
  
  loadSettings();

  // ✅ Ініціалізація
  loadVoices(); // Завантаження голосів та налаштувань
});
