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

document.getElementById('cross').addEventListener('click', function() {
  window.close();
});

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'uk-UA'; 
  speechSynthesis.speak(utterance);
}

document.addEventListener("DOMContentLoaded", () => {
  const speechRateInput = document.getElementById("speechRate");
  const speechInput = document.getElementById("speedInput");
  const toneRateInput = document.getElementById("toneRate");
  const toneInput = document.getElementById("toneInput");
  const saveSettingsButton = document.getElementById("applyButton");

  chrome.storage.sync.get("settings", (data) => {
    const settings = data.settings || {};

    speechRateInput.value = settings.speechRate || 1;
    speechInput.value = settings.speechRate || 1;
    toneRateInput.value = settings.toneRate || 1;
    toneInput.value = settings.toneRate || 1;
  });

  function saveSettings() {
    const settings = {
      speechRate: parseFloat(speechRateInput.value),
      toneRate: parseFloat(toneRateInput.value),
    };

    chrome.storage.sync.set({ settings }, () => {
      console.log("Налаштування збережено!", settings);
    });
  }

  function speak(text, speechRate, toneRate) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = speechRate;
    speech.pitch = toneRate;
    window.speechSynthesis.speak(speech);
  }

  saveSettingsButton.addEventListener("click", () => {
    saveSettings();

    const exampleText = "Текст для перевірки швидкості та тону озвучення!";

    const speechRate = parseFloat(speechRateInput.value) || 1;
    const toneRate = parseFloat(toneRateInput.value) || 1;

    speak(exampleText, speechRate, toneRate);
  });

  function syncInputs(input, output) {
    output.value = input.value;
  }

  speechRateInput.addEventListener("input", () => syncInputs(speechRateInput, speechInput));
  toneRateInput.addEventListener("input", () => syncInputs(toneRateInput, toneInput));

  speechInput.addEventListener("input", () => syncInputs(speechInput, speechRateInput));
  toneInput.addEventListener("input", () => syncInputs(toneInput, toneRateInput));
});
