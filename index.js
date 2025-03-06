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

  stopButton.addEventListener('click', () => {
    window.speechSynthesis.cancel();
    console.log("Мовлення зупинено.");
  });

  let currentMode = null;
  let voices = [];
  let selectedVoice = null;
  let isSpeaking = false;  // Додаємо прапорець для перевірки озвучення

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
      }
    }

    const rate = parseFloat(speechInput.value);
    const pitch = parseFloat(toneInput.value);

    // Ensure rate and pitch are valid numbers
    if (!isNaN(rate) && rate >= 0.1 && rate <= 2) {
      speechSynthesis.rate = rate;
    }

    if (!isNaN(pitch) && pitch >= 0 && pitch <= 2) {
      speechSynthesis.pitch = pitch;
    }
  }

  function speak(text) {
    if (isSpeaking) return;

    isSpeaking = true;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.voice || voices[0];
    utterance.rate = speechSynthesis.rate;
    utterance.pitch = speechSynthesis.pitch;

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

  chrome.storage.sync.get("settings", (data) => {
    console.log("Отримані налаштування:", data);
    const settings = data.settings || { mode: "defaultMode" };

    highlightActiveMode(settings.mode);
  });

  function saveModeSettings(selectedMode) {
    chrome.storage.sync.set({ settings: { mode: selectedMode } }, () => {
      console.log("Режим збережено:", { mode: selectedMode });
      highlightActiveMode(selectedMode);
      alert(`Режим змінено на: ${getModeName(selectedMode)}`);
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
});
