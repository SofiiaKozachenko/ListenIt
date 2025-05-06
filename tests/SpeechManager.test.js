const SpeechManager = require('../js/SpeechManager');

describe('SpeechManager', () => {
  let speechManager;
  const mockVoices = [
    { name: 'English', lang: 'en-US' },
    { name: 'Ukrainian', lang: 'uk-UA' }
  ];

  beforeEach(() => {
    global.speechSynthesis = {
      speak: jest.fn(),
      cancel: jest.fn(),
      getVoices: jest.fn(() => mockVoices),
      onvoiceschanged: null,
    };

    global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
      text,
      voice: null,
      rate: 1,
      pitch: 1,
    }));

    speechManager = new SpeechManager();
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  test('should load voices correctly', () => {
    expect(speechManager.getVoices()).toEqual(mockVoices);
    expect(speechManager.selectedVoice).toEqual(mockVoices[0]);
  });

  test('should set selected voice', () => {
    const voice = mockVoices[1];
    speechManager.setSelectedVoice(voice);
    expect(speechManager.selectedVoice).toBe(voice);
    expect(console.log).toHaveBeenCalledWith('Selected Voice:', voice);
  });

  test('should speak text correctly', () => {
    speechManager.selectedVoice = mockVoices[0];
    speechManager.currentRate = 1.2;
    speechManager.currentPitch = 1.1;
    speechManager.speak('Hello');

    expect(speechSynthesis.speak).toHaveBeenCalled();
    const utterance = speechSynthesis.speak.mock.calls[0][0];
    expect(utterance.text).toBe('Hello');
    expect(utterance.voice).toEqual(mockVoices[0]);
    expect(utterance.rate).toBe(1);
    expect(utterance.pitch).toBe(1);
  });

  test('should stop speech', () => {
    speechManager.stopSpeech();
    expect(speechSynthesis.cancel).toHaveBeenCalled();
  });

  test('should test voice settings', () => {
    speechManager.selectedVoice = mockVoices[0];
    speechManager.testVoice(1.5, 0.9);
    expect(speechSynthesis.speak).toHaveBeenCalled();
    const utterance = speechSynthesis.speak.mock.calls[0][0];
    expect(utterance.rate).toBe(1.5);
    expect(utterance.pitch).toBe(0.9);
  });

  test('should handle empty text gracefully', () => {
    speechManager.speak('');
    expect(console.error).toHaveBeenCalledWith("The text for speech is empty.");
    expect(speechSynthesis.speak).not.toHaveBeenCalled();
  });
});
