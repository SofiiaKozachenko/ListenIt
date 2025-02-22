document.getElementById('hoverModeBtn').addEventListener('click', function() {
    window.location.href = 'test2.html';
});
  
document.getElementById('fullPageMode').addEventListener('click', function() {
    window.location.href = 'test2.html';
});
  
document.getElementById('selectedTextMode').addEventListener('click', function() {
    window.location.href = 'test2.html';
});
  
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

    chrome.storage.sync.get("settings", (data) => {
        console.log("Отримані налаштування:", data);
        const settings = data.settings || { mode: "defaultMode" };

        highlightActiveMode(settings.mode);
    });

    function saveModeSettings(selectedMode) {
        chrome.storage.sync.set({ settings: { mode: selectedMode } }, () => {
            console.log("Режим збережено:", { mode: selectedMode });
            highlightActiveMode(selectedMode);
            alert(`Режим змінено на: ${getModeName(selectedMode)}`); // Відображення повідомлення
        });
    }

    function highlightActiveMode(activeMode) {
        document.querySelectorAll(".button-style").forEach(btn => {
            btn.classList.remove("active-mode");
        });

        const activeButton = document.getElementById(activeMode);
        if (activeButton) {
            activeButton.classList.add("active-mode"); 
        }
    }

    function getModeName(modeId) {
        switch (modeId) {
            case "hoverModeBtn": return "При наведенні мишки";
            case "fullPageMode": return "Весь вміст сторінки";
            case "selectedTextMode": return "Виділений текст";
            default: return "Невідомий режим";
        }
    }

    hoverModeBtn.addEventListener("click", () => saveModeSettings("hoverModeBtn"));
    fullPageModeBtn.addEventListener("click", () => saveModeSettings("fullPageMode"));
    selectedTextModeBtn.addEventListener("click", () => saveModeSettings("selectedTextMode"));
});

document.addEventListener("DOMContentLoaded", () => {
  const modeButtons = document.querySelectorAll(".button-style");

  modeButtons.forEach(button => {
    button.addEventListener("click", () => {
      const selectedMode = button.id;

      chrome.storage.sync.get("settings", ({ settings = {} }) => {
        const updatedSettings = { ...settings, mode: selectedMode };

        chrome.storage.sync.set({ settings: updatedSettings }, () => {
          console.log(`✅ Режим '${selectedMode}' збережено.`);
          setTimeout(() => {
            window.location.href = "test2.html"; // Переходимо після збереження
          }, 100); // Затримка для гарантії запису
        });
      });
    });
  });
});


