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
    // Викликаємо озвучення вмісту сторінки при завантаженні
    window.addEventListener("load", readPageContent);
  } else {
    document.addEventListener("focusin", handleTabFocus);
  }

  loadVoices();
});


function loadVoices() {
  voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    voicesLoaded = true;
  } else {
    setTimeout(loadVoices, 100);
  }
}

let lastSpokenText = ""; // Ініціалізуємо змінну

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



function handleTabFocus(event) {
  const target = event.target;
  if (target instanceof HTMLElement && isTextContent(target)) {
    const text = target.innerText.trim();
    if (text) speak(text);
  }
}

function isTextContent(element) {
  if (settings.ignoreAds && element.closest(".ad")) return false;

  const tagName = element.tagName.toLowerCase();
  const validTags = [
    "p", "span", "li", "a", "h1", "h2", "h3", "h4", "h5", "h6",
    "button", "label", "blockquote", "cite", "q", "strong", "em",
    "td", "th", "caption", "summary", "figcaption", "code", "pre"
  ];

  const hasText = element.innerText?.trim() || element.alt || element.title;
  return validTags.includes(tagName) && hasText;
}

function speak(text) {
  if (!voicesLoaded) {
    setTimeout(() => speak(text), 100); // Якщо голоси ще не завантажені, чекаємо
    return;
  }

  if (currentUtterance) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }

  currentUtterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = voices.find(v => v.name === settings.selectedVoice);
  currentUtterance.voice = selectedVoice || null;
  currentUtterance.lang = settings.autoDetectLanguage ? detectLanguage(text) : settings.language || "uk-UA";
  currentUtterance.rate = settings.speechRate || 1;
  currentUtterance.pitch = settings.speechPitch || 1;

  currentUtterance.onend = () => {
    currentUtterance = null;
  };

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

function readPageContent() {
  let fullText = document.body.innerText.trim();

  // Якщо тексту в `body` недостатньо, зчитуємо всі текстові елементи
  if (!fullText) {
    const elements = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, span, a");
    fullText = Array.from(elements)
      .map(element => element.innerText.trim())
      .filter(text => text) // Фільтруємо порожні рядки
      .join(" ");
  }

  if (fullText) {
    speak(fullText);
  } else {
    console.warn("Не вдалося знайти текст для озвучення.");
  }
}

