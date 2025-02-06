function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'uk-UA'; 
  speechSynthesis.speak(utterance);
}

document.addEventListener("DOMContentLoaded", () => {
  const defaultModeRadio = document.getElementById("defaultMode");
  const hoverModeRadio = document.getElementById("hoverModeBtn");
  const readPageModeRadio = document.getElementById("fullPageMode");
  const selectionModeRadio = document.getElementById("selectionTextMode");
  const autoDetectLanguageCheckbox = document.getElementById("autoDetectLanguage");
  const ignoreAdsCheckbox = document.getElementById("ignoreAds");
  const voiceSelect = document.getElementById("voice-btn");
  const speechRateInput = document.getElementById("speechRate");
  const speechPitchInput = document.getElementById("toneRate");
  const saveSettingsButton = document.getElementById("applyButton");
  const stopSpeechButton = document.getElementById("stopMode");

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
          mode: selectionModeRadio.checked ? 'selectionTextMode' :
              defaultModeRadio.checked ? 'defaultMode' :
              hoverModeRadio.checked ? 'hoverMode' : 
              readPageModeRadio.checked ? 'fullPageMode' : 'defaultMode',
          autoDetectLanguage: autoDetectLanguageCheckbox.checked,
          ignoreAds: ignoreAdsCheckbox.checked,
          selectedVoice: voiceSelect.value || "",
          speechRate: parseFloat(speechRateInput.value),
          speechPitch: parseFloat(speechPitchInput.value),
      };

      chrome.storage.sync.set({ settings }, () => {
          alert("Налаштування збережено!");
      });
  }

  loadSettings();

  saveSettingsButton.addEventListener("click", saveSettings);
});
