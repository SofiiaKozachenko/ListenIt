// Налаштування за замовчуванням
let language = "uk-UA";
let speed = 1;
let voice = "female";

// Отримуємо налаштування з хранилища
chrome.storage.sync.get(["language", "speed", "voice"], (settings) => {
  language = settings.language || "uk-UA";
  speed = settings.speed || 1;
  voice = settings.voice || "female";
});

// Створюємо змінну для відстеження останнього озвученого тексту
let lastSpokenText = "";
document.getElementById("femaleVoice").addEventListener("click", () => {
  // Активуємо жіночий голос
  document.getElementById("femaleVoice").classList.add("active");
  document.getElementById("maleVoice").classList.remove("active");
});

document.getElementById("maleVoice").addEventListener("click", () => {
  // Активуємо чоловічий голос
  document.getElementById("maleVoice").classList.add("active");
  document.getElementById("femaleVoice").classList.remove("active");
});

// Визначаємо текст під курсором
document.body.addEventListener("mouseover", (event) => {
  const target = event.target;
  if (target && target.innerText) {
    const text = target.innerText.trim();

    if (text) {
      chrome.runtime.sendMessage(
        {
          type: "speak",
          text: text,
          language: language,
          speed: speed,
          voice: voice
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Помилка озвучення:", chrome.runtime.lastError.message);
          } else {
            console.log("Озвучено:", text);
          }
        }
      );
    }
  }
});
