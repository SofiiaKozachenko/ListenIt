document.addEventListener("DOMContentLoaded", () => {
  const hoverModeCheckbox = document.getElementById("hoverMode");
  const autoDetectLanguageCheckbox = document.getElementById("autoDetectLanguage");
  const ignoreAdsCheckbox = document.getElementById("ignoreAds");
  const voiceSelect = document.getElementById("voiceSelect");
  const languageSelect = document.getElementById("languageSelect");
  const speechRateInput = document.getElementById("speechRate");
  const speechPitchInput = document.getElementById("speechPitch");
  const saveSettingsButton = document.getElementById("saveSettings");

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

      hoverModeCheckbox.checked = settings.hoverMode || false;
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
      hoverMode: hoverModeCheckbox.checked,
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

  saveSettingsButton.addEventListener("click", saveSettings);

  populateVoices();
  speechSynthesis.onvoiceschanged = populateVoices;
  loadSettings();
});
