let isSpeaking = false; 
let voices = [];
let speechSynthesis = window.speechSynthesis; 
let settings = {};

// Завантаження голосів
function loadVoices() {
  if (!voicesLoadedPromise) {
    voicesLoadedPromise = new Promise(resolve => {
      const checkVoices = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices);
        } else {
          setTimeout(checkVoices, 100);
        }
      };

      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
          const voices = speechSynthesis.getVoices();
          if (voices.length > 0) {
            resolve(voices);
          }
        };
      }
      checkVoices();
    });
  }

  return voicesLoadedPromise;
}

// Функція для озвучення тексту
async function speak(text) {
  if (!text.trim()) {
    console.warn("⚠️ Порожній текст не може бути озвучений.");
    return;
  }

  if (isSpeaking) return;

  isSpeaking = true;

  try {
    await loadVoices();

    let selectedVoice = null;
    const settings = await loadSettings();
    
    if (settings.selectedVoice) {
      selectedVoice = voices.find(v => v.name === settings.selectedVoice);
      if (!selectedVoice) {
        console.warn(`⚠️ Обраний голос '${settings.selectedVoice}' не знайдено. Використовується стандартний.`);
      }
    }

    const currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.voice = selectedVoice || voices[0];
    currentUtterance.rate = settings.speechRate || 1;
    currentUtterance.pitch = settings.toneRate || 1;

    speechSynthesis.speak(currentUtterance);
    currentUtterance.onend = () => {
      isSpeaking = false;
    };
  } catch (error) {
    console.error(`❌ Помилка при спробі озвучення: ${error.message}`);
    isSpeaking = false;
  }
}

function stopMode() {
  speechSynthesis.cancel();
  isSpeaking = false;
}

function startHoverMode() {
  document.body.addEventListener('mouseover', (event) => {
    const target = event.target;
    if (target && target.textContent) {
      console.log(target.textContent);
      speak(target.textContent);
    }
  });
}

function startFullPageMode() {
  const bodyText = document.body.innerText;
  speak(bodyText);
}

function startSelectedTextMode() {
  document.body.addEventListener('mouseover', (event) => {
    const target = event.target;
    if (target && target.textContent) {
      console.log(target.textContent);
      speak(target.textContent);
    }
  });
}

function isTextContent(element) {
  return element instanceof HTMLElement && 
    !element.closest(".ad") && 
    (element.innerText?.trim() || element.alt || element.title);
}

async function loadSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get("settings", (data) => {
      resolve(data.settings || {});
    });
  });
}

chrome.runtime.onMessage.addListener((message) => {
  chrome.storage.sync.get("settings", (data) => {
    const settings = data.settings || {}; // Отримуємо налаштування

    if (message.mode === "selectedTextMode") {
      startSelectedTextMode(settings);
    }

    if (message.mode === "hoverModeBtn") {
      startHoverMode(settings);
    }

    if (message.mode === "fullPageMode") {
      startFullPageMode(settings);
    }
  });
});


speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();
