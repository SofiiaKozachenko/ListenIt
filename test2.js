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

document.addEventListener("DOMContentLoaded", () => {
    const voiceSelect = document.getElementById("voice-btn");
    const speechRateInput = document.getElementById("speechRate"); // Ползунок для швидкості
    const saveSettingsButton = document.getElementById("applyButton");

    // Завантаження збережених налаштувань
    function loadSettings() {
      chrome.storage.sync.get("settings", (data) => {
        const settings = data.settings || {};

        // Встановлення значень у UI
        speechRateInput.value = settings.speechRate || 50; // Встановлюємо значення швидкості

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

    // Озвучення тестового тексту при зміні голосу або швидкості
    function testVoice() {
      const selectedVoiceName = voiceSelect.value;
      const testText = "Це тестовий текст для перевірки голосу.";
      const utterance = new SpeechSynthesisUtterance(testText);

      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.name === selectedVoiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = parseFloat(speechRateInput.value) / 50 || 1; // Оновлюємо швидкість на основі значення ползунка

      speechSynthesis.speak(utterance);
    }

    // Збереження налаштувань
    saveSettingsButton.addEventListener("click", () => {
      const settings = {
        selectedVoice: voiceSelect.value,
        speechRate: parseFloat(speechRateInput.value), // Отримуємо значення швидкості
      };

      chrome.storage.sync.set({ settings }, () => {
        alert("Налаштування збережено!");
      });
    });

    // Прив'язка події зміни голосу або швидкості
    voiceSelect.addEventListener("change", testVoice);
    speechRateInput.addEventListener("input", testVoice); // Додано обробник для зміни значення ползунка

    // Завантаження голосів при ініціалізації
    populateVoices();
    speechSynthesis.onvoiceschanged = populateVoices;

    // Завантаження налаштувань при відкритті popup
    loadSettings();
});