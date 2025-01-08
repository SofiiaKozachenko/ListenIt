document.getElementById('hoverModeBtn').addEventListener('click', function() {
    window.location.href = 'test2.html';
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



  