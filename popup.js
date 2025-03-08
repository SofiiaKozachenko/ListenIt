document.addEventListener("DOMContentLoaded", () => {
  const hoverModeButton = document.getElementById("hoverMode");
  const readPageModeButton = document.getElementById("readPageMode");
  const selectionModeButton = document.getElementById("selectionMode");
  const ignoreAdsCheckbox = document.getElementById("ignoreAds");
  const voiceSelect = document.getElementById("voiceSelect");
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
      }

      ignoreAdsCheckbox.checked = settings.ignoreAds || false;

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

  function testVoice() {
    const selectedVoiceName = voiceSelect.value;
    const utterance = new SpeechSynthesisUtterance("Це тестовий текст для перевірки голосу.");
    utterance.voice = voices.find(voice => voice.name === selectedVoiceName) ?? null;
    utterance.rate = parseFloat(speechRateInput.value) || 1;
    utterance.pitch = parseFloat(speechPitchInput.value) || 1;
    speechSynthesis.speak(utterance);
  }

 saveSettingsButton?.addEventListener("click", () => {
    const settings = {
        mode: document.querySelector('.button-style.active')?.id.replace('Mode', '') || 'default',
        ignoreAds: ignoreAdsCheckbox?.checked ?? false,
        selectedVoice: voiceSelect?.value ?? "",
        speechRate: parseFloat(speechRateInput?.value) || 1,
        speechPitch: parseFloat(speechPitchInput?.value) || 1,
    };

    chrome.storage.sync.set({ settings }, () => {
        alert("Налаштування збережено!");
        loadSettings();
    });
});

  stopSpeechButton?.addEventListener("click", () => {
    speechSynthesis.cancel();
  });

  voiceSelect?.addEventListener("change", testVoice);
  speechRateInput?.addEventListener("change", testVoice);
  speechPitchInput?.addEventListener("change", testVoice);

  hoverModeButton.addEventListener('click', () => {
    updateMode('hoverMode');
  });

  readPageModeButton.addEventListener('click', () => {
    updateMode('readPageMode');
  });

  selectionModeButton.addEventListener('click', () => {
    updateMode('selectionMode');
  });

  function updateMode(mode) {
    chrome.storage.sync.get("settings", (data) => {
      const settings = data.settings || {};
      settings.mode = mode;
      chrome.storage.sync.set({ settings });
      loadSettings();
    });
  }

  loadVoices();
});