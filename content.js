let settings = {};
let currentUtterance = null;
let voices = []; // Попередньо завантажені голоси
let voicesLoaded = false;
let lastSpokenText = ""; // Для уникнення повторного озвучення

// Завантаження налаштувань
chrome.storage.sync.get("settings", (data) => {
  settings = data.settings || {};

  // Встановлення обробників залежно від режиму
  if (settings.hoverMode) {
    document.addEventListener("mouseover", handleMouseOver);
  }

  document.addEventListener("focusin", handleTabFocus);

  // Завантаження голосів
  loadVoices();
});

// Завантаження голосів
function loadVoices() {
  voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    voicesLoaded = true;
  } else {
    setTimeout(loadVoices, 100); // Повторна спроба через 100 мс
  }
}

// Обробка наведення мишкою
function handleMouseOver(event) {
  const target = event.target;
  if (target instanceof HTMLElement && isTextContent(target)) {
    const text = target.innerText.trim();
    if (text && text !== lastSpokenText) {
      lastSpokenText = text;
      speak(text);
    }
  }
}

// Обробка вибору через Tab
function handleTabFocus(event) {
  const target = event.target;
  if (target instanceof HTMLElement && isTextContent(target)) {
    const text = target.innerText.trim();
    if (text && text !== lastSpokenText) {
      lastSpokenText = text;
      speak(text);
    }
  }
}

// Перевірка текстового контенту
function isTextContent(element) {
  if (settings.ignoreAds && element.closest(".ad")) return false; // Ігнорувати рекламу
  return element.innerText?.trim() || element.alt || element.title;
}

// Функція озвучення
function speak(text) {
  if (!voicesLoaded) {
    setTimeout(() => speak(text), 100); // Якщо голоси ще не завантажені, пробуємо знову
    return;
  }

  // Зупиняємо поточне озвучення
  if (currentUtterance) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }

  currentUtterance = new SpeechSynthesisUtterance(text);

  // Встановлення голосу
  const selectedVoice = voices.find(v => v.name === settings.selectedVoice);
  currentUtterance.voice = selectedVoice || null;

  // Встановлення мови
  currentUtterance.lang = settings.autoDetectLanguage ? detectLanguage(text) : settings.language || "uk-UA";

  // Інші налаштування
  currentUtterance.rate = settings.speechRate || 1;
  currentUtterance.pitch = settings.speechPitch || 1;

  currentUtterance.onend = () => {
    currentUtterance = null; // Звільнення після завершення
    lastSpokenText = ""; // Скидаємо останній текст
  };

  speechSynthesis.speak(currentUtterance);
}

// Функція для визначення мови тексту
function detectLanguage(text) {
  const ukrainianPattern = /[а-яіїєґ]/i;
  const russianPattern = /[а-яё]/i;
  const englishPattern = /[a-z]/i;

  if (ukrainianPattern.test(text)) return "uk-UA";
  if (russianPattern.test(text)) return "ru-RU";
  if (englishPattern.test(text)) return "en-US";
  return "uk-UA"; // За замовчуванням
}
