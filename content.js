let settings = {};
let currentUtterance = null;
let voices = [];
let voicesLoaded = false;

chrome.storage.sync.get("settings", (data) => {
  settings = data.settings || {};

  if (settings.mode === 'hover') {
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("focusin", handleTabFocus);
  } else if (settings.mode === 'readPage') {
    window.addEventListener("load", observeAndReadPageContent);
  document.addEventListener("focusin", handleTabFocus);
  } else if (settings.mode === 'selection') {
    document.addEventListener("mouseup", handleTextSelection);
    document.addEventListener("focusin", handleTabFocus);
  } else {
    document.addEventListener("focusin", handleTabFocus);
  }

  loadVoices();
});

const adSelectors = [".ad", "[id*='ads']", "[class*='ads']", "iframe", "script"];

function isTextContent(element) {
  if (settings.ignoreAds && isAd(element)) return false;
  return element.innerText?.trim() || element.alt || element.title;
}

function isAd(element) {
  return adSelectors.some(selector => element.closest(selector));
}

function loadVoices() {
  voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    voicesLoaded = true;
  } else {
    setTimeout(loadVoices, 100);
  }
}

function handleMouseOver(event) {
  const target = event.target;
  if (target instanceof HTMLElement && isTextContent(target)) {
    const text = target.innerText.trim();
    if (text.length > 1500) return;
    if (text) speak(text);
  }
}

function handleTabFocus(event) {
  const target = event.target;
  if (target instanceof HTMLElement && isTextContent(target)) {
    const text = target.innerText.trim();
    if (text) speak(text);
  }
}

function handleTextSelection() {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    speak(selectedText);
  }
}
document.addEventListener("click", () => {
    console.log("Розблокування синтезу мови...");
    userInteracted = true; // Відзначаємо, що була взаємодія
    if (settings.mode === 'readPage') {
        observeAndReadPageContent();
    }
}, { once: true });

let userInteracted = false; // Перевіряємо, чи була взаємодія користувача

chrome.storage.sync.get("settings", (data) => {
    settings = data.settings || {};

    if (settings.mode === 'readPage') { 
        window.addEventListener("load", () => {
            if (userInteracted) {
                observeAndReadPageContent();
            }
        });
    }

    if (settings.mode === 'selection' || settings.mode === 'readPage') {
        document.addEventListener("focusin", (event) => {
            if (userInteracted) {
                handleTabFocus(event);
            }
        });
    }
});

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
  
  // Вибираємо голос
  const selectedVoice = voices.find(v => v.name === settings.selectedVoice);
  if (!selectedVoice) {
    console.warn("Вибраний голос не знайдено, використовується стандартний.");
  }
  currentUtterance.voice = selectedVoice || voices[0] || null;

  // Визначаємо мову
  currentUtterance.lang = detectLanguage(text) || "uk-UA";
  currentUtterance.rate = settings.speechRate || 1;
  currentUtterance.pitch = settings.speechPitch || 1;

 currentUtterance.onerror = (e) => {
    console.error("Помилка озвучення:", e.error);
    console.error("Деталі помилки:", e);

    if (e.error === "not-allowed") {
        console.warn("Доступ до синтезу мови заблоковано браузером. Перевірте дозволи.");
    } else if (e.error === "interrupted") {
        console.warn("Озвучення перервано.");
    } else if (e.error === "audio-busy") {
        console.warn("Аудіо-засіб зайнятий, спробуйте ще раз.");
    } else {
        console.warn("Невідома помилка озвучення.");
    }
};


  try {
    speechSynthesis.speak(currentUtterance);
  } catch (err) {
    console.error("Помилка під час спроби озвучення:", err);
  }
}



function detectLanguage(text) {
  const ukrainianPattern = /[а-яіїєґ]/i;
  const russianPattern = /[а-яё]/i;
  const englishPattern = /[a-z]/i;

  if (ukrainianPattern.test(text)) return "uk-UA";
  if (russianPattern.test(text)) return "ru-RU";
  if (englishPattern.test(text)) return "en-US";
  return "uk-UA";
}

function observeAndReadPageContent() {
  removeAds();
  readPageContent();

  const observer = new MutationObserver(() => {
    observer.disconnect();
    removeAds();
    readPageContent();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function readPageContent() {
  const pageText = document.body.innerText.trim();
  if (pageText) {
    speak(pageText);
  }
}

function speakParagraphs(paragraphs, index) {
  if (index < paragraphs.length) {
    speak(paragraphs[index]);
    currentUtterance.onend = () => {
      requestAnimationFrame(() => speakParagraphs(paragraphs, index + 1));
    };
  }
}

function removeAds() {
  adSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(ad => ad.remove());
  });
}