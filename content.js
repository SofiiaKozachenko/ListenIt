let settings = {};
let currentUtterance = null;
let voices = [];
let voicesLoaded = false;
let userInteracted = false;

const languageVoiceMap = {
  "uk": ["Microsoft Pavel", "Microsoft Irina"],
  "en": ["Microsoft David", "Microsoft Zira", "Google US English Female", "Google US English Male"]
};

class TextExtractor {
  getPageText() {
    return getUniversalPageText();
  }
  getTextFromPageElement(element) {
    if (element instanceof HTMLElement) {
      return element.innerText?.trim() || element.alt || element.title || "";
    }
    return "";
  }
  getSelectedText() {
    return window.getSelection().toString().trim();
  }
}

const textExtractor = new TextExtractor();

const adSelectors = [
  ".ad",
  ".advertisment",
  "[id*='ads']",
  "[class*='ads']",
  "iframe",
  "script"
];

function isAd(element) {
  if (!element) return false;
  return adSelectors.some(selector => element.closest(selector));
}

function loadVoices() {
  voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    voicesLoaded = true;
    console.log("Голоси завантажено:", voices.map(v => `${v.name} (${v.lang})`));
    autoUpdateVoiceByPageLang();
  } else {
    setTimeout(loadVoices, 100);
  }
}

function initVoices() {
  loadVoices();
  if (!voicesLoaded) {
    speechSynthesis.addEventListener('voiceschanged', () => {
      loadVoices();
    });
  }
}

initVoices();

document.addEventListener("click", () => {
  console.log("Розблокування синтезу мови...");
  userInteracted = true;
  if (settings.mode === 'readPage') {
    observeAndReadPageContent();
  }
}, { once: true });

chrome.storage.sync.get("settings", (data) => {
  settings = data.settings || {};
  console.log(`Поточний режим: ${settings.mode || "не встановлено"}`);
  console.log(`Вибраний голос: ${settings.selectedVoice || "голос не встановлено"}`);

  if (settings.mode === 'hover') {
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("focusin", handleTabFocus);
  } else if (settings.mode === 'readPage') {
    window.addEventListener("load", () => {
      if (userInteracted) {
        setTimeout(() => observeAndReadPageContent(), 3000);
      }
    });
    document.addEventListener("focusin", handleTabFocus);
  } else if (settings.mode === 'selection') {
    document.addEventListener("mouseup", handleTextSelection);
    document.addEventListener("focusin", handleTabFocus);
  } else {
    document.addEventListener("focusin", handleTabFocus);
  }
});

function getPageLanguageCode() {
  const htmlLang = document.documentElement.lang || document.querySelector('html')?.getAttribute('lang') || "";
  const langCode = htmlLang.toLowerCase().split('-')[0];
  console.log("Мова сторінки з <html lang>:", langCode);
  return langCode;
}

function autoUpdateVoiceByPageLang() {
  const langCode = getPageLanguageCode();

  const possibleVoices = languageVoiceMap[langCode];
  if (!possibleVoices) {
    console.warn(`Голоси для мови '${langCode}' не знайдені.`);
    return;
  }

  let bestVoice = null;
  for (const voiceName of possibleVoices) {
    const voice = voices.find(v => v.name.toLowerCase().includes(voiceName.toLowerCase()));
    if (voice) {
      bestVoice = voice.name;
      break;
    }
  }

  if (!bestVoice) {
    console.warn(`Не знайдено підходящого голосу для мови ${langCode}`);
    return;
  }

  settings.selectedVoice = bestVoice;
  chrome.storage.sync.set({ settings }, () => {
    console.log(`Голос для мови '${langCode}' встановлено: ${bestVoice}`);
  });
}

function handleMouseOver(event) {
  if (!voicesLoaded) return;
  const target = event.target;
  if (settings.ignoreAds && isAd(target)) return;
  const text = textExtractor.getTextFromPageElement(target);
  if (text && text.length <= 1500) {
    speak(text);
  }
}

function handleTabFocus(event) {
  if (!voicesLoaded) return;
  const target = event.target;
  if (settings.ignoreAds && isAd(target)) return;
  const text = textExtractor.getTextFromPageElement(target);
  if (text) {
    speak(text);
  }
}

function handleTextSelection() {
  if (!voicesLoaded) return;
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  const anchorNode = selection.anchorNode?.parentElement;
  if (settings.ignoreAds && isAd(anchorNode)) return;
  if (selectedText) {
    speak(selectedText);
  }
}

function observeAndReadPageContent() {
  removeAds();
  readPageContent();
  const observer = new MutationObserver(() => {
    removeAds();
    readPageContent();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function readPageContent() {
  const pageText = textExtractor.getPageText();
  console.log("Текст для озвучення:", pageText);
  if (pageText) {
    speak(pageText);
  } else {
    console.warn("Текст для озвучення не знайдено");
  }
}

async function speak(text) {
  if (!text.trim()) {
    console.error("Текст для озвучення порожній.");
    return;
  }

  const langCode = getPageLanguageCode();

  if (langCode === 'uk') {
    chrome.runtime.sendMessage({ action: 'tts', text }, response => {
      if (response?.audioUrl) {
        const audio = new Audio(response.audioUrl);
        audio.play().catch(err => console.error("Помилка відтворення аудіо:", err));
      } else {
        console.error("Помилка ElevenLabs TTS:", response?.error);
        speakWithWebSpeech(text);
      }
    });
  } else {
    speakWithWebSpeech(text);
  }
}

function speakWithWebSpeech(text) {
  if (!voicesLoaded) {
    console.warn("Голоси ще не завантажилися. Чекаємо...");
    setTimeout(() => speakWithWebSpeech(text), 500);
    return;
  }
  if (currentUtterance) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }
  currentUtterance = new SpeechSynthesisUtterance(text);

  const selectedVoice = voices.find(v =>
    v.name.toLowerCase() === (settings.selectedVoice || "").toLowerCase()
  );

  if (!selectedVoice) {
    console.warn("Обраний голос не знайдено, використовується стандартний.");
  }
  currentUtterance.voice = selectedVoice || voices[0] || null;

  if (!currentUtterance.voice) {
    console.warn("Голос для озвучення не встановлено, пропускаємо озвучення.");
    return;
  }

  currentUtterance.lang = getPageLanguageCode() === 'uk' ? 'uk-UA' : 'en-US';
  currentUtterance.rate = settings.speechRate || 1;
  currentUtterance.pitch = settings.speechPitch || 1;

  console.log(`Озвучення тексту голосом: ${currentUtterance.voice.name}`);
  console.log(`Мова озвучення: ${currentUtterance.lang}`);

  currentUtterance.onerror = (e) => {
    console.error("Помилка озвучення:", e.error);
  };

  try {
    speechSynthesis.speak(currentUtterance);
  } catch (err) {
    console.error("Помилка при озвученні:", err);
  }
}

function removeAds() {
  adSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(ad => ad.remove());
  });
}

chrome.runtime.sendMessage({ action: 'tts', text }, response => {
  if (response?.audioBase64) {
    const audioSrc = `data:audio/mpeg;base64,${response.audioBase64}`;
    const audio = new Audio(audioSrc);
    audio.play().catch(err => console.error("Помилка відтворення аудіо:", err));
  } else if (response?.error) {
    console.error("Помилка ElevenLabs TTS:", response.error);
    speakWithWebSpeech(text);
  } else {
    console.error("Невідома помилка ElevenLabs TTS");
    speakWithWebSpeech(text);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Отримано повідомлення:", message);
  switch(message.action) {
    case 'hover':
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseup", handleTextSelection);
      settings.mode = 'hover';
      document.addEventListener("mouseover", handleMouseOver);
      document.addEventListener("focusin", handleTabFocus);
      break;
    case 'readPage':
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseup", handleTextSelection);
      settings.mode = 'readPage';
      observeAndReadPageContent();
      break;
    case 'selection':
      document.removeEventListener("mouseover", handleMouseOver);
      settings.mode = 'selection';
      document.addEventListener("mouseup", handleTextSelection);
      document.addEventListener("focusin", handleTabFocus);
      break;
    case 'read-selected-text':
      const selectedText = textExtractor.getSelectedText();
      if (selectedText) {
        speak(selectedText);
      } else {
        console.log("Текст не виділено");
      }
      break;
  }
  sendResponse({success: true});
});
