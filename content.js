import { TextExtractor } from "./js/TextExtractor";
import { ContentObserver } from "./js/ContentObserver";
import ModeManager from "./js/ModeManager";
import SpeechManager from "./js/SpeechManager";

let settings = {};
let userInteracted = false;

const textExtractor = new TextExtractor();
const speechManager = new SpeechManager();
const contentObserver = new ContentObserver(observeMutations);
const modeManager = new ModeManager(speechManager, textExtractor, contentObserver);

function loadVoices() {
  speechManager.loadVoices();
}

document.addEventListener("click", () => {
  console.log("Unblocking speech synthesis...");
  userInteracted = true;
  if (settings.mode === 'readPage') {
    modeManager.observeAndReadPageContent(); 
  }
}, { once: true });

chrome.storage.sync.get("settings", (data) => {
  settings = data.settings || {};
  
  modeManager.applyMode();
  loadVoices();
});

function removeAds() {
  const adSelectors = [".ad", "[id*='ads']", "[class*='ads']", "iframe", "script"];
  adSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(ad => ad.remove());
  });
}
