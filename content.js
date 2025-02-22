let settings = {};
let currentUtterance = null;
let voices = [];
let voicesLoaded = false;

// Завантаження налаштувань та ініціалізація
chrome.storage.sync.get("settings", (data) => {
  settings = data.settings || {};
  loadVoices();
  
  switch (settings.mode) {
    case 'hoverModeBtn':
      document.addEventListener("mouseover", handleMouseOver);
      break;
    case 'fullPageMode':
      window.addEventListener("load", observeAndReadPageContent);
      break;
    case 'selectedTextMode':
      document.addEventListener("mouseup", handleTextSelection);
      break;
    default:
      document.addEventListener("focusin", handleTabFocus);
  }
});

let voicesLoadedPromise = null;

function loadVoices() {
    if (!voicesLoadedPromise) {
        voicesLoadedPromise = new Promise(resolve => {
            const checkVoices = () => {
                const voices = speechSynthesis.getVoices();
                if (voices.length > 0) {
                    resolve(voices);
                } else {
                    setTimeout(checkVoices, 100);
                }
            };
            
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = () => {
                    const voices = speechSynthesis.getVoices();
                    if (voices.length > 0) {
                        resolve(voices);
                    }
                };
            }
            checkVoices();
        });
    }
    
    return voicesLoadedPromise;
}

async function speak(text) {
    if (!text.trim()) {
        console.warn("⚠️ Порожній текст не може бути озвучений.");
        return;
    }

    if (currentUtterance) {
        speechSynthesis.cancel();
        currentUtterance = null;
    }

    try {
        await loadVoices();
        
        currentUtterance = new SpeechSynthesisUtterance(text);
        let selectedVoice = null;
        
        if (settings.selectedVoice) {
            selectedVoice = voices.find(v => v.name === settings.selectedVoice);
            if (!selectedVoice) {
                console.warn(`⚠️ Обраний голос '${settings.selectedVoice}' не знайдено. Використовується стандартний.`);
            }
        }

        currentUtterance.voice = selectedVoice || voices[0];
        currentUtterance.rate = settings.speechRate || 1;
        currentUtterance.pitch = settings.toneRate || 1;
        
        speechSynthesis.speak(currentUtterance);
    } catch (error) {
        console.error(`❌ Помилка при спробі озвучення: ${error.message}`);
    }
}

function handleMouseOver(event) {
  if (isTextContent(event.target)) {
    speak(event.target.innerText.trim());
  }
}

function handleTabFocus(event) {
  if (isTextContent(event.target)) {
    speak(event.target.innerText.trim());
  }
}

function handleTextSelection() {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) speak(selectedText);
}

function isTextContent(element) {
  return element instanceof HTMLElement && !element.closest(".ad") && (element.innerText?.trim() || element.alt || element.title);
}

function observeAndReadPageContent() {
  speak(document.body.innerText.trim());

  new MutationObserver(() => {
    speak(document.body.innerText.trim());
  }).observe(document.body, { childList: true, subtree: true });
}
