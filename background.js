chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["content.js"]
  });
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "speak") {
    const utterance = new SpeechSynthesisUtterance(message.text);
    speechSynthesis.speak(utterance);
  }
});



