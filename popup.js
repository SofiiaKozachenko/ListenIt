import UiManager from "./js/UiManager.js";
import SpeechManager from "./js/SpeechManager.js";
import SettingManager from "./js/SettingManager.js";
import ModeManager from "./js/ModeManager.js";

function observeMutations(mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList' || mutation.type === 'subtree') {
      removeAds();
      readPageContent();
      break; // Stop after handling the first mutation
    }
  }
}
  
function removeAds() {
  const adSelectors = [".ad", "[id*='ads']", "[class*='ads']", "iframe", "script"];
  adSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(ad => ad.remove());
  });
}
  
function readPageContent() {
  const pageText = document.body.innerText.trim();
  if (pageText) {
    console.log("Reading page content:", pageText); // Replace with actual speechManager.speak() if needed
    }
  }
  
  // Use MutationObserver to observe changes in the DOM
  const observer = new MutationObserver(observeMutations);
  observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener("DOMContentLoaded", () => {
    const speechManager = new SpeechManager();
    const modeManager = new ModeManager(speechManager);
    const uiManager = new UiManager(speechManager, modeManager);
    const settingManager = new SettingManager(uiManager, speechManager);
    uiManager.loadSettings();

    const hoverModeButton = document.getElementById("hoverMode");
    const readPageModeButton = document.getElementById("readPageMode");
    const selectionModeButton = document.getElementById("selectionMode");
    const ignoreAdsCheckbox = document.getElementById("ignoreAds");
    const voiceBtn = document.getElementById("voice-btn");
    const voiceList = document.getElementById("voice-list");
    const saveSettingsButton = document.getElementById("saveSettings");
    const stopSpeechButton = document.getElementById("stopSpeech");

    let selectedVoice = null;
    let voices = [];

    function populateVoices() {
        voices = speechSynthesis.getVoices();
        voiceList.innerHTML = "";
        voiceBtn.textContent = "Оберіть голос";

        voices.forEach(voice => {
            const voiceItem = document.createElement("div");
            voiceItem.innerHTML = `${voice.name} (${voice.lang})`;

            voiceItem.classList.add("dropdown-item");
            voiceItem.addEventListener("click", () => {
                voiceBtn.textContent = `${voice.name} (${voice.lang})`;
                selectedVoice = voice.name;
                voiceList.classList.remove("show");
                speechManager.testVoice();
            });
            voiceList.appendChild(voiceItem);
        });

        if (voices.length > 0 && !selectedVoice) {
            selectedVoice = voices[0].name;
        }
    }

    window.addEventListener('load', () => {
        populateVoices();
        settingManager.loadSettings();

        setTimeout(() => {
            console.log("Trying to speak...");
            const welcomeMessage = document.getElementById('welcomeMessage');
            const instructionsMessage = document.getElementById('instructionsMessage');

            if (!instructionsMessage || !welcomeMessage) {
                console.error("Element not found!");
                return;
            }

            speechManager.speak(welcomeMessage.innerText);
            speechManager.speak(instructionsMessage.innerText);
        }, 1000);
    });

    voiceBtn.addEventListener("click", () => {
        voiceList.classList.toggle("show");
    });

    window.addEventListener("click", (event) => {
        if (!event.target.matches(".dropdown-btn")) {
            if (voiceList.classList.contains("show")) {
                voiceList.classList.remove("show");
            }
        }
    });

    function loadSettings() {
        chrome.storage.sync.get("settings", (data) => {
            const settings = data.settings || {};

            if (settings.mode === 'hoverMode') {
                hoverModeButton.classList.add('active');
                readPageModeButton.classList.remove('active');
                selectionModeButton.classList.remove('active');
            } else if (settings.mode === 'readPageMode') {
                readPageModeButton.classList.add('active');
                hoverModeButton.classList.remove('active');
                selectionModeButton.classList.remove('active');
            } else if (settings.mode === 'selectionMode') {
                selectionModeButton.classList.add('active');
                hoverModeButton.classList.remove('active');
                readPageModeButton.classList.remove('active');
            } else {
                hoverModeButton.classList.remove('active');
                readPageModeButton.classList.remove('active');
                selectionModeButton.classList.remove('active');
            }

            ignoreAdsCheckbox.checked = settings.ignoreAds || false;
            uiManager.speechRateInput.value = settings.speechRate || 1;
            uiManager.speechPitchInput.value = settings.speechPitch || 1;
            uiManager.speechRateSlider.value = settings.speechRate || 1;
            uiManager.speechPitchSlider.value = settings.speechPitch || 1;
            selectedVoice = settings.selectedVoice || null;

            if (speechSynthesis.getVoices().length > 0) {
                populateVoices();
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    populateVoices();
                };
            }
        });
    }

    saveSettingsButton?.addEventListener("click", () => {
    const activeButton = document.querySelector('.button-style.active');
    const mode = activeButton ? activeButton.id.replace('Mode', '') : 'hover'; 
    const settings = {
        mode: mode, 
        ignoreAds: ignoreAdsCheckbox?.checked ?? false,
        selectedVoice: selectedVoice,
        speechRate: parseFloat(uiManager.speechRateInput?.value) || 1,
        speechPitch: parseFloat(uiManager.speechPitchInput?.value) || 1,
    };

    chrome.storage.sync.set({ settings }, () => {
        document.querySelectorAll('.button-style').forEach(button => {
            if (button.id.replace('Mode', '') === settings.mode) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        loadSettings();

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs.length > 0) {
            chrome.tabs.reload(tabs[0].id);
          }
        });
      });
    });

    stopSpeechButton?.addEventListener("click", () => {
        speechManager.stopSpeech();
    });

    loadSettings();
});