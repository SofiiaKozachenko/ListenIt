document.addEventListener('DOMContentLoaded', () => {
  console.log('content.js підключено', window.location.href);
});

let settings = {};
let currentUtterance = null; // Для зберігання поточного озвучення
let voicesLoaded = false; // Статус завантаження голосів

// Завантаження налаштувань
chrome.storage.sync.get("settings", (data) => {
  settings = data.settings || {};

  // Якщо активовано режим озвучення при наведенні мишки
  if (settings.hoverMode) {
    document.addEventListener("mouseover", handleMouseOver);
  }

  // Якщо активовано режим тільки для Tab
  if (!settings.hoverMode) {
    document.addEventListener("focusin", handleTabFocus);
  }
});

// Функція для обробки озвучення при наведенні мишки
function handleMouseOver(event) {
  const target = event.target;
  if (target instanceof HTMLElement && isTextContent(target)) {
    const text = target.innerText.trim();
    if (text.length > 1500) return;
    if (text) speak(text);
  }
}

// Функція для обробки озвучення при переході через Tab
function handleTabFocus(event) {
  const target = event.target;
  if (target instanceof HTMLElement && isTextContent(target)) {
    const text = target.innerText.trim();
    if (text) speak(text);
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
  currentUtterance.lang = settings.autoDetectLanguage ? detectLanguage(text) : settings.language || "uk-UA";
  currentUtterance.rate = settings.speechRate || 1;
  currentUtterance.pitch = settings.speechPitch || 1;

  currentUtterance.onerror = (e) => console.error("Помилка озвучення:", e);

  speechSynthesis.speak(currentUtterance);
}

// Функція зупинки озвучення
function stopSpeaking() {
  if (currentUtterance) {
    speechSynthesis.cancel(); // Зупиняє озвучення
    currentUtterance = null;
  }
}

// Завантаження голосів
function loadVoices() {
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    voicesLoaded = true; // Встановлюємо, що голоси завантажено
  } else {
    setTimeout(loadVoices, 100); // Пробуємо ще раз через 100 мс
  }
}

function observeAndReadPageContent() {
  readPageContent(); // Одразу озвучуємо сторінку при завантаженні

  // Відстежуємо зміни DOM
  const observer = new MutationObserver(() => {
    observer.disconnect(); // Зупиняємо, щоб уникнути дублювання
    readPageContent(); // Озвучуємо сторінку
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function readPageContent() {
  const pageText = document.body.innerText.trim();
  if (pageText) {
    speak(pageText);
  }
}

// Завантажуємо голоси при першому запуску
speechSynthesis.onvoiceschanged = loadVoices;

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "stopSpeech") {
    stopSpeaking(); // Зупиняє озвучення
  }
});

const newDiv = document.createElement("div");
newDiv.innerHTML = `<iframe src="index.html" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
document.body.appendChild(newDiv);

const hoverModeBtn = document.getElementById('hoverModeBtn');

// Функція для озвучування тексту при наведенні мишки
function speakOnHover(event) {
  const target = event.target;
  const text = target.textContent || target.innerText;

  if (text.trim() !== "") { // Перевірка на наявність тексту
      console.log("Наведений текст:", text); // Для відлагодження
      speak(text);
  }
}

// Обробник події наведення курсору на елемент
/*document.addEventListener('mouseover', (event) => {
  if (hoverModeBtn.classList.contains('active')) {
    const element = event.target;
    const text = element.textContent || element.innerText;
    speakOnHover(text);
  }
});

// Логіка для ввімкнення/вимкнення режиму озвучування при кліку на кнопку
hoverModeBtn.addEventListener('click', () => {
  hoverModeBtn.classList.toggle('active');
});*/

document.addEventListener("mouseup", () => {
  const selection = window.getSelection();
  if (!selection.rangeCount || selection.isCollapsed) {
    console.log("Немає виділеного тексту.");
    return;
  }

  const selectedText = selection.toString().trim();
  console.log("Виділений текст:", selectedText);

  if (selectedText.length > 0) {
    chrome.runtime.sendMessage({ action: "speak", text: selectedText });
  }
});
