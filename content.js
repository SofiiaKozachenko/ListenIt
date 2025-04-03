function removeAds() {
  const adSelectors = [".ad", "[id*='ads']", "[class*='ads']", "iframe", "script"];
  adSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(ad => ad.remove());
  });
}

function readPageContent() {
  const pageText = textExtractor.getPageText();
  if (pageText) {
    speechManager.speak(pageText);
  }
}

const speechManager = new SpeechManager();
const textExtractor = new TextExtractor();
const contentObserver = new ContentObserver(observeMutations);

const modeManager = new ModeManager(speechManager, textExtractor, contentObserver);

document.addEventListener("DOMContentLoaded", () => {
  modeManager.applyMode();
});

function observeMutations(mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList' || mutation.type === 'subtree') {
      removeAds();
      readPageContent();
      break;
    }
  }
}
