document.addEventListener("DOMContentLoaded", () => {
  const speechRateInput = document.getElementById("speechRate");
  const speechInput = document.getElementById("speedInput");
  const toneRateInput = document.getElementById("toneRate");
  const toneInput = document.getElementById("toneInput");
  const ignoreAdsCheckbox = document.getElementById("ignoreAds");
  const saveSettingsButton = document.getElementById("applyButton");
  const voiceBtn = document.getElementById("voice-btn");
  const voiceList = document.getElementById("voice-list");

  let selectedVoice = null;

  chrome.storage.sync.get("settings", (data) => {
    const settings = data.settings || { mode: "defaultMode" };  // За замовчуванням mode = "defaultMode"
    
    console.log("Збережені налаштування:", settings);
  
    if (settings.mode) {
      console.log("Режим:", settings.mode);
    } else {
      console.log("Режим не знайдено, використовуються стандартні налаштування.");
    }
  });
  
  function populateVoices() {
    const voices = speechSynthesis.getVoices();
    voiceList.innerHTML = "";

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

  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoices;
  } else {
    populateVoices();
  }

  chrome.storage.sync.get("settings", ({ settings = {} }) => {
    speechRateInput.value = settings.speechRate || 1;
    speechInput.value = settings.speechRate || 1;
    toneRateInput.value = settings.toneRate || 1;
    toneInput.value = settings.toneRate || 1;
    ignoreAdsCheckbox.checked = settings.ignoreAds || false;

    if (settings.selectedVoice) {
      selectedVoice = settings.selectedVoice;
      voiceBtn.textContent = settings.selectedVoice;
    } else {
      voiceBtn.textContent = "Оберіть голос";
    }
  });

  function saveSettings() {
    const settings = {
      speechRate: parseFloat(speechRateInput.value),
      toneRate: parseFloat(toneRateInput.value),
      ignoreAds: ignoreAdsCheckbox.checked,
      selectedVoice: selectedVoice,
    };

    chrome.storage.sync.set({ settings }, () => {
      console.log("Налаштування збережено:", settings);
    });
  }

  saveSettingsButton.addEventListener("click", () => {
    saveSettings();
    
    chrome.storage.sync.get("settings", ({ settings = {} }) => {
      console.log("Збережені налаштування:", settings);
    });
  
    const exampleText = "Текст для перевірки швидкості, тембру та голосу!";
    speak(exampleText, parseFloat(speechRateInput.value), parseFloat(toneRateInput.value), selectedVoice);
  });
  

  function speak(text, speechRate, toneRate, voiceName) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = toneRate;

    const voice = speechSynthesis.getVoices().find(v => v.name === voiceName);
    if (voice) utterance.voice = voice;

    speechSynthesis.speak(utterance);
  }

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
});