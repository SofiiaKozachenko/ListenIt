// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const defaultModeRadio = document.getElementById("defaultMode");
  const hoverModeRadio = document.getElementById("hoverMode");
  const readPageModeRadio = document.getElementById("readPageMode");
  const selectionModeRadio = document.getElementById("selectionMode");
  const autoDetectLanguageCheckbox = document.getElementById("autoDetectLanguage");
  const ignoreAdsCheckbox = document.getElementById("ignoreAds");
  const voiceSelect = document.getElementById("voiceSelect");
  const languageSelect = document.getElementById("languageSelect");
  const speechRateInput = document.getElementById("speechRate");
  const speechPitchInput = document.getElementById("speechPitch");
  const saveSettingsButton = document.getElementById("saveSettings");
  const stopSpeechButton = document.getElementById("stopSpeech");

  function populateVoices() {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      voiceSelect.innerHTML = voices
        .map(voice => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`)
        .join("");
    }
  }

  function loadSettings() {
    chrome.storage.sync.get("settings", (data) => {
      const settings = data.settings || {};

      if (settings.mode === 'hoverMode') {
        hoverModeRadio.checked = true;
      } else if (settings.mode === 'readPageMode') {
        readPageModeRadio.checked = true;
      } else if (settings.mode === 'selectionMode') {
        selectionModeRadio.checked = true;
      } else {
        defaultModeRadio.checked = true;
      }

      autoDetectLanguageCheckbox.checked = settings.autoDetectLanguage || false;
      ignoreAdsCheckbox.checked = settings.ignoreAds || false;
      languageSelect.value = settings.language || "uk-UA";
      speechRateInput.value = settings.speechRate || 1;
      speechPitchInput.value = settings.speechPitch || 1;

      const voices = speechSynthesis.getVoices();
      if (voices.length > 0 && settings.selectedVoice) {
        const selectedVoice = voices.find(voice => voice.name === settings.selectedVoice);
        if (selectedVoice) {
          voiceSelect.value = selectedVoice.name;
        }
      }
    });
  }

  function saveSettings() {
  const settings = {
    mode: selectionModeRadio.checked ? 'selectionMode' :
          defaultModeRadio.checked ? 'defaultMode' :
          hoverModeRadio.checked ? 'hoverMode' : 
          readPageModeRadio.checked ? 'readPageMode' : 'defaultMode',
    autoDetectLanguage: autoDetectLanguageCheckbox.checked,
    ignoreAds: ignoreAdsCheckbox.checked,
    selectedVoice: voiceSelect.value || "",
    language: languageSelect.value,
    speechRate: parseFloat(speechRateInput.value),
    speechPitch: parseFloat(speechPitchInput.value),
  };

  chrome.storage.sync.set({ settings }, () => {
    alert("Налаштування збережено!");
  });
}


  function stopSpeech() {
    speechSynthesis.cancel(); // Зупиняємо озвучення
  }

  saveSettingsButton.addEventListener("click", saveSettings);
  stopSpeechButton.addEventListener("click", stopSpeech);

  populateVoices();
  speechSynthesis.onvoiceschanged = populateVoices;
  loadSettings();
});
