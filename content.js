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

  // Перевірка, чи елемент містить текст, alt або title
  if (target instanceof HTMLElement) {
    if (target.innerText && target.innerText.trim() !== "") {
      stopSpeaking();
      speak(target.innerText);
    } else if (target.alt && target.tagName.toLowerCase() === "img") {
      stopSpeaking();
      speak(target.alt);
    } else if (target.title) {
      stopSpeaking();
      speak(target.title);
    }
  }
}

// Функція для обробки озвучення при переході через Tab
function handleTabFocus(event) {
  const target = event.target;

  // Перевірка, чи елемент містить текст, alt або title
  if (target instanceof HTMLElement) {
    // Озвучуємо лише елементи, які мають текст або інші озвучувані атрибути
    if (target.innerText && target.innerText.trim() !== "") {
      stopSpeaking();
      speak(target.innerText);
    } else if (target.alt && target.tagName.toLowerCase() === "img") {
      stopSpeaking();
      speak(target.alt);
    } else if (target.title) {
      stopSpeaking();
      speak(target.title);
    }
  }
}

// Функція озвучення
function speak(text, lang = "uk-UA") {
  if (!voicesLoaded) {
    setTimeout(() => speak(text, lang), 100); // Якщо голоси ще не завантажені, пробуємо знову
    return;
  }

  // Зупиняємо попереднє озвучення
  if (currentUtterance) {
    stopSpeaking();
  }

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = settings.autoDetectLanguage ? lang : "uk-UA";
  currentUtterance.voice = speechSynthesis.getVoices().find(v => v.name === settings.selectedVoice);
  currentUtterance.rate = settings.speechRate || 1;
  currentUtterance.onend = () => {
    currentUtterance = null; // Встановлюємо null після завершення озвучення
  };

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
document.addEventListener('mouseover', (event) => {
  if (hoverModeBtn.classList.contains('active')) {
    const element = event.target;
    const text = element.textContent || element.innerText;
    speakOnHover(text);
  }
});

// Логіка для ввімкнення/вимкнення режиму озвучування при кліку на кнопку
hoverModeBtn.addEventListener('click', () => {
  hoverModeBtn.classList.toggle('active');
});

// Використання бібліотеки Cheerio для парсингу HTML
const cheerio = require('cheerio');

const $ = cheerio.load(html);
$('a').text('Посилання');
const simplifiedHtml = $.html();

