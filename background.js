chrome.commands.onCommand.addListener((command) => {
  if (command === "selectedTextMode") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "readSelectedText" });
    });
  } else if (command === "stopSpeaking") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "stopSpeaking" });
    });
  }else if (command === "stop-speech") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "stopSpeech" });
    });
  }
});
