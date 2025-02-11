document.getElementById('hoverModeBtn').addEventListener('click', function() {
    window.location.href = 'test2.html';
});
  
document.getElementById('fullPageMode').addEventListener('click', function() {
    window.location.href = 'test2.html';
});
  
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
    const hoverModeRadio = document.getElementById("hoverModeBtn");
    const readPageModeRadio = document.getElementById("fullPageMode");
    const selectionModeRadio = document.getElementById("selectedTextMode");
  
    // Завантаження збережених налаштувань
    chrome.storage.sync.get("settings", (data) => {
      const settings = data.settings || {};
      if (settings.mode === 'hoverMode') {
        hoverModeRadio.checked = true;
      } else if (settings.mode === 'readPageMode') {
        readPageModeRadio.checked = true;
      } else if (settings.mode === 'selectionMode') {
        selectionModeRadio.checked = true;
      }
    });
  
    // Збереження вибраного режиму
    function saveModeSettings() {
      const settings = {
        mode: hoverModeRadio.checked ? 'hoverMode' :
          readPageModeRadio.checked ? 'readPageMode' :
          selectionModeRadio.checked ? 'selectionMode' : 'defaultMode',
      };
  
      chrome.storage.sync.set({ settings }, () => {
        alert("Режим збережено!");
      });
    }
  
    // Додавання слухача для збереження
    hoverModeRadio.addEventListener("click", saveModeSettings);
    readPageModeRadio.addEventListener("click", saveModeSettings);
    selectionModeRadio.addEventListener("click", saveModeSettings);
  });
  