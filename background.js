chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: command });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'tts') {
    synthesizeTextElevenLabs(request.text)
      .then(base64Audio => sendResponse({ audioBase64: base64Audio }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'tts') {
    try {
      const audioUrl = await synthesizeTextElevenLabs(request.text);
      sendResponse({ audioUrl });
    } catch (e) {
      sendResponse({ error: e.message });
    }
    return true; // Вказуємо що відповіді будуть асинхронними
  }
});

async function synthesizeTextElevenLabs(text) {
  const apiKey = 'sk_17872954be3c1b42f0906a5f7500e387127d72206b82dcc7';
  const voiceId = '3rWBcFHu7rpPUEJQYEqD';

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text: text,
      voice_settings: { stability: 0.75, similarity_boost: 0.75 }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API помилка: ${response.status} ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();

  // Конвертуємо в base64
  const base64Audio = arrayBufferToBase64(arrayBuffer);

  return base64Audio;
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
