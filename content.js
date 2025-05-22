let settings = {};
let currentUtterance = null;
let voices = [];
let voicesLoaded = false;
let userInteracted = false;

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
  } else {
    setTimeout(loadVoices, 100);
  }
}

function initVoices() {
  loadVoices();
  if (voicesLoaded) {
    autoUpdateVoiceByPageLang();
  } else {
    speechSynthesis.addEventListener('voiceschanged', () => {
      loadVoices();
      autoUpdateVoiceByPageLang();
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
        // Затримка для динамічного контенту
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

  loadVoices();
});

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
  // Для динамічного оновлення контенту
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

function speak(text) {
  if (!text.trim()) {
    console.error("Текст для озвучення порожній.");
    return;
  }
  if (!voicesLoaded) {
    console.warn("Голоси ще не завантажилися. Чекаємо...");
    setTimeout(() => speak(text), 500);
    return;
  }
  if (currentUtterance) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }
  currentUtterance = new SpeechSynthesisUtterance(text);

  const pageLang = getPageLanguage();
  currentUtterance.lang = pageLang;

  autoUpdateVoiceByPageLang();

  const selectedVoice = voices.find(v =>
    v.name.toLowerCase() === (settings.selectedVoice || "").toLowerCase()
  );

  if (!selectedVoice) {
    console.warn("Вибраний голос не знайдено, використовується стандартний.");
  }
  currentUtterance.voice = selectedVoice || voices[0] || null;

  if (!currentUtterance.voice) {
    console.warn("Голос для озвучення не встановлено, пропускаємо озвучення.");
    return;
  }

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

const languageVoiceMap = {
  "uk": ["Microsoft Pavel"],
  "en": ["Microsoft David", "Microsoft Zira", "Google US English"]
};

function autoUpdateVoiceByPageLang() {
  const pageLang = getPageLanguage();
  const langCode = pageLang.slice(0, 2).toLowerCase();
  const possibleVoices = languageVoiceMap[langCode];
  if (!possibleVoices) return;

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

  if (langCode === "uk") {
    settings.selectedVoice = bestVoice;
    chrome.storage.sync.set({ settings }, () => {
      console.log(`Голос для української встановлено: ${bestVoice}`);
    });
  } else if (langCode === "en") {
    chrome.storage.sync.get("settings", (data) => {
      const currentSettings = data.settings || {};
      if (currentSettings.selectedVoice !== bestVoice) {
        currentSettings.selectedVoice = bestVoice;
        chrome.storage.sync.set({ settings: currentSettings }, () => {
          console.log(`Голос для англійської оновлено: ${bestVoice}`);
        });
      }
    });
  }
}

function getUniversalPageText() {
  const selectors = ['main', 'article', '.content', '.main-content', '.post-content', '.article-content'];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      const text = el.innerText.trim();
      if (text.length > 100) {
        return cleanText(text);
      }
    }
  }
  const candidates = Array.from(document.querySelectorAll('div, section, article'))
    .map(el => ({el, length: el.innerText.trim().length}))
    .filter(x => x.length > 100);
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.length - a.length);
    return cleanText(candidates[0].el.innerText.trim());
  }
  const bodyText = document.body.innerText.trim();
  if (bodyText.length > 100) {
    return cleanText(bodyText);
  }
  return "";
}

function cleanText(text) {
  return text
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function getPageLanguage() {
  const htmlLang = document.documentElement.lang || document.querySelector('html')?.getAttribute('lang');
  if (htmlLang) {
    return htmlLang.startsWith('uk') ? 'uk-UA' : htmlLang.startsWith('en') ? 'en-US' : htmlLang;
  }
  const mainContent = getUniversalPageText();
  const cleanTextContent = mainContent.replace(/https?:\/\/[^\s]+/gi, '');
  return detectLanguage(cleanTextContent) || "uk-UA";
}

function detectLanguage(text) {
  if (!text || text.length < 10) return "uk-UA";

  const ukrainianPattern = /[їієґщфхцчшжюяєґ]/gi;
  const ukrainianWords = /\b(та|і|в|на|з|для|що|який|як|де|коли|чому|тому|але|або|якщо|тоді)\b/gi;
  const englishPattern = /\b(the|and|or|in|on|at|to|for|with|by|from|this|that|what|how|when|where|why)\b/gi;

  const ukrainianChars = text.match(ukrainianPattern) || [];
  const ukrainianWordsMatch = text.match(ukrainianWords) || [];
  const englishWords = text.match(englishPattern) || [];

  const ukrainianScore = ukrainianChars.length + (ukrainianWordsMatch.length * 2);
  const englishScore = englishWords.length;

  if (ukrainianChars.length > 0 && ukrainianScore >= englishScore) {
    return "uk-UA";
  }
  return englishScore > ukrainianScore ? "en-US" : "uk-UA";
}

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
