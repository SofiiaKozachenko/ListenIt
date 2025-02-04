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
  

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'uk-UA'; 
  speechSynthesis.speak(utterance);
}

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

let selectionModeEnabled = false;

// Активація режиму читання при натисканні на кнопку
document.getElementById('selectedTextMode').addEventListener('click', function() {
  selectionModeEnabled = true;
  console.log("Режим читання виділеного тексту активовано");
});

document.addEventListener("mouseup", () => {
  const selection = window.getSelection();

  // Логування об'єкта Selection для діагностики
  console.log("Повний об'єкт Selection:", selection);

  if (!selection.rangeCount || selection.isCollapsed) {
    console.log("Немає виділеного тексту або лише курсор.");
    return;
  }

  const selectedText = selection.toString().trim();

  if (selectedText.length > 0) {
    speak(selectedText);
  } else {
    console.log("Виділений текст порожній.");
  }
});





