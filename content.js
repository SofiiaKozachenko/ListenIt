let isSpeaking = false;
let voices = [];
let voicesLoadedPromise = null;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null; // Додано для збереження поточного utterance
chrome.runtime.onMessage.addListener(async (message) => {
    const settings = await loadSettings();

    if (message.mode === "selectedTextMode") {
        startSelectedTextMode(settings);
    } else if (message.mode === "hoverModeBtn") {
        startHoverMode(settings);
    } else if (message.mode === "fullPageMode") {
        startFullPageMode(settings);
    } else if (message.action === "read-selected-text") {
        startSelectedTextMode();
    } else if (message.action === "stop") {
        stopSpeaking(); // Додано обробку команди stop
    }
});
async function loadVoices() {
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
                    checkVoices();
                };
            }
            checkVoices();
        });
    }

    return voicesLoadedPromise;
}

async function speak(text) {
    if (!text.trim()) {
        console.warn("Порожній текст не може бути озвучений.");
        return;
    }

    if (isSpeaking) {
        stopSpeaking(); // Зупиняємо попереднє озвучення
    }

    isSpeaking = true;

    try {
        await loadVoices();

        let selectedVoice = null;
        const settings = await loadSettings();

        if (settings.selectedVoice) {
            selectedVoice = voices.find(v => v.name === settings.selectedVoice);
            if (!selectedVoice) {
                console.warn(`Обраний голос '${settings.selectedVoice}' не знайдено. Використовується стандартний.`);
            }
        }

        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.voice = selectedVoice || voices[0];
        currentUtterance.rate = settings.speechRate || 1;
        currentUtterance.pitch = settings.toneRate || 1;

        speechSynthesis.speak(currentUtterance);
        currentUtterance.onend = () => {
            isSpeaking = false;
        };
    } catch (error) {
        console.error(`Помилка при спробі озвучення: ${error.message}`);
        isSpeaking = false;
    }
}

function stopSpeaking() {
    if (currentUtterance) {
        speechSynthesis.cancel();
        isSpeaking = false;
        currentUtterance = null;
    }
}

function startHoverMode() {
    stopSpeaking();
    activeMode = "hoverMode";
    let lastTarget = null; // Додаємо змінну для відстеження останнього озвученого елемента

    document.body.addEventListener('mousemove', (event) => {
        if (activeMode === "hoverMode") {
            const target = event.target;

            // Перевіряємо, чи миша все ще знаходиться над тим самим елементом
            if (target !== lastTarget) {
                lastTarget = target; // Оновлюємо останній озвучений елемент

                if (target && target.textContent) {
                    const text = target.textContent.trim();
                    const maxLength = 1500;

                    if (text.length <= maxLength) {
                        speak(text);
                    } else {
                       return;
                    }
                }
            }
        }
    });
}
function startFullPageMode() {
    const bodyText = document.body.innerText;
    speak(bodyText);
}

function startSelectedTextMode() {
    const selectedText = window.getSelection().toString();
    if (selectedText) {
        speak(selectedText);
    }
}

async function loadSettings() {
    return new Promise(resolve => {
        chrome.storage.sync.get("settings", (data) => {
            resolve(data.settings || {});
        });
    });
}



speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();