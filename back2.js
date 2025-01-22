chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    language: "uk-UA",
    speed: 1,
    voice: "female"
  });
  console.log("Розширення ListenIt2 встановлено.");
});

// Функція для озвучення тексту
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "speak") {
    const { text, language, speed, voice } = request;

    chrome.tts.speak(text, {
      lang: language,
      rate: speed,
      gender: voice === "female" ? "female" : "male"
    });

    sendResponse({ success: true });
  }
});
