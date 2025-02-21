let settings = {};
let currentUtterance = null;
let voices = [];
let voicesLoaded = false;

chrome.storage.sync.get("settings", (data) => {
  settings = data.settings || {};

  if (settings.mode === 'hoverMode') {
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("focusin", handleTabFocus);
  } else if (settings.mode === 'readPageMode') {
    window.addEventListener("load", observeAndReadPageContent);
  } else if (settings.mode === 'selectionMode') {
    document.addEventListener("mouseup", handleTextSelection);
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

function speak(text) {
  if (!voicesLoaded) {
    setTimeout(() => speak(text), 100);
    return;
  }

  if (currentUtterance) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }

  currentUtterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = voices.find(v => v.name === settings.selectedVoice);
  currentUtterance.voice = selectedVoice || null;
  currentUtterance.lang =  detectLanguage(text) || "uk-UA";
  currentUtterance.rate = settings.speechRate || 1;
  currentUtterance.pitch = settings.speechPitch || 1;

  currentUtterance.onerror = (e) => console.error("Помилка озвучення:", e);

  speechSynthesis.speak(currentUtterance);
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

function removeAds() {
  adSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(ad => ad.remove());
  });
}


