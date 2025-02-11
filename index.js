/*document.getElementById('hoverModeBtn').addEventListener('click', function() {
    window.location.href = 'test2.html';
});*/
  
/*document.getElementById('fullPageMode').addEventListener('click', function() {
    window.location.href = 'test2.html';
});*/
  
/*document.getElementById('selectedTextMode').addEventListener('click', function() {
    window.location.href = 'test2.html';
});*/
  
document.getElementById('cross').addEventListener('click', function() {
    window.close(); // Закриває спливаюче вікно розширення
});
  
window.addEventListener('load', () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const instructionsMessage = document.getElementById('instructionsMessage');
    speak(welcomeMessage.innerText);
    speak(instructionsMessage.innerText);
});

const stopButton = document.getElementById('stopMode');

stopButton.addEventListener('click', () => {
  window.speechSynthesis.cancel();
  console.log("Мовлення зупинено.");
});

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'uk-UA'; 
    speechSynthesis.speak(utterance);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const hoverModeBtn = document.getElementById("hoverModeBtn");
    const fullPageModeBtn = document.getElementById("fullPageMode");
    const selectedTextModeBtn = document.getElementById("selectedTextMode");

    // Завантаження збереженого режиму
    chrome.storage.sync.get("settings", (data) => {
        console.log("Отримані налаштування:", data);
        const settings = data.settings || { mode: "defaultMode" };

        // Виділяємо активну кнопку
        highlightActiveMode(settings.mode);
    });

    // Функція для збереження вибраного режиму
    function saveModeSettings(selectedMode) {
        chrome.storage.sync.set({ settings: { mode: selectedMode } }, () => {
            console.log("Режим збережено:", { mode: selectedMode });
            highlightActiveMode(selectedMode);
            alert(`Режим змінено на: ${getModeName(selectedMode)}`); // Відображення повідомлення
        });
    }

    // Функція для підсвічування активного режиму
    function highlightActiveMode(activeMode) {
        document.querySelectorAll(".button-style").forEach(btn => {
            btn.classList.remove("active-mode"); // Видаляємо підсвічування з усіх кнопок
        });

        const activeButton = document.getElementById(activeMode);
        if (activeButton) {
            activeButton.classList.add("active-mode"); // Додаємо підсвічування
        }
    }

    // Функція для красивого відображення назв режимів в alert
    function getModeName(modeId) {
        switch (modeId) {
            case "hoverModeBtn": return "При наведенні мишки";
            case "fullPageMode": return "Весь вміст сторінки";
            case "selectedTextMode": return "Виділений текст";
            default: return "Невідомий режим";
        }
    }

    // Додаємо обробники подій для кнопок
    hoverModeBtn.addEventListener("click", () => saveModeSettings("hoverModeBtn"));
    fullPageModeBtn.addEventListener("click", () => saveModeSettings("fullPageMode"));
    selectedTextModeBtn.addEventListener("click", () => saveModeSettings("selectedTextMode"));
});



  