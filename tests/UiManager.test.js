const UiManager = require('../js/UiManager');

describe('UiManager', () => {
  let speechManagerMock;
  let modeManagerMock;
  let elements;

  beforeEach(() => {
    // Мокаємо chrome.storage
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn((key, callback) => {
            callback({ settings: { speechRate: 1.2, speechPitch: 0.8 } });
          }),
        },
      },
    };

    // Створення фейкових елементів DOM
    elements = {
      speechRate: document.createElement('input'),
      speechRate2: document.createElement('input'),
      speechPitch: document.createElement('input'),
      toneRate: document.createElement('input'),
      cross: document.createElement('button'),
      hoverMode: document.createElement('button'),
      readPageMode: document.createElement('button'),
      selectionMode: document.createElement('button'),
      stopSpeech: document.createElement('button'),
    };

    for (const [id, el] of Object.entries(elements)) {
      el.id = id;
      el.classList.add('button-style'); // Для setActiveButton
      document.body.appendChild(el);
    }

    speechManagerMock = {
      speak: jest.fn(),
      testVoice: jest.fn(),
    };

    modeManagerMock = {
      activateHoverMode: jest.fn(),
      activateFullPageMode: jest.fn(),
      activateSelectedTextMode: jest.fn(),
    };
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('should initialize and bind event listeners', () => {
    const uiManager = new UiManager(speechManagerMock, modeManagerMock);

    elements.hoverMode.click();
    expect(modeManagerMock.activateHoverMode).toHaveBeenCalled();

    elements.hoverMode.dispatchEvent(new Event('focus'));
    expect(speechManagerMock.speak).toHaveBeenCalledWith('Режим читання наведенням мишки');
  });

  test('should handle full page mode button click and focus', () => {
    new UiManager(speechManagerMock, modeManagerMock);

    elements.readPageMode.click();
    expect(modeManagerMock.activateFullPageMode).toHaveBeenCalled();

    elements.readPageMode.dispatchEvent(new Event('focus'));
    expect(speechManagerMock.speak).toHaveBeenCalledWith('Режим читання всього тексту');
  });

  test('should handle selection mode button click and focus', () => {
    new UiManager(speechManagerMock, modeManagerMock);

    elements.selectionMode.click();
    expect(modeManagerMock.activateSelectedTextMode).toHaveBeenCalled();

    elements.selectionMode.dispatchEvent(new Event('focus'));
    expect(speechManagerMock.speak).toHaveBeenCalledWith('Режим читання виділеного тексту');
  });

  test('should speak description when stop button is focused', () => {
    new UiManager(speechManagerMock, modeManagerMock);

    elements.stopSpeech.dispatchEvent(new Event('focus'));
    expect(speechManagerMock.speak).toHaveBeenCalledWith('Кнопка для зупинки озвучення');
  });

  test('should update inputs and call testVoice on speechRate slider input', () => {
    new UiManager(speechManagerMock, modeManagerMock);

    elements.speechRate2.value = '1.5';
    elements.speechRate2.dispatchEvent(new Event('input'));

    expect(elements.speechRate.value).toBe('1.5');
    expect(speechManagerMock.testVoice).toHaveBeenCalledWith(1.5, 0.8);
  });

  test('should update slider and call testVoice on speechRate input change', () => {
    new UiManager(speechManagerMock, modeManagerMock);

    elements.speechRate.value = '2';
    elements.speechRate.dispatchEvent(new Event('change'));

    expect(elements.speechRate2.value).toBe('2');
    expect(speechManagerMock.testVoice).toHaveBeenCalledWith(2, 0.8);
  });

  test('should update inputs and call testVoice on speechPitch slider input', () => {
    new UiManager(speechManagerMock, modeManagerMock);

    elements.toneRate.value = '0.6';
    elements.toneRate.dispatchEvent(new Event('input'));

    expect(elements.speechPitch.value).toBe('0.6');
    expect(speechManagerMock.testVoice).toHaveBeenCalledWith(1.2, 0.6);
  });

  test('should update slider and call testVoice on speechPitch input change', () => {
    new UiManager(speechManagerMock, modeManagerMock);

    elements.speechPitch.value = '0.9';
    elements.speechPitch.dispatchEvent(new Event('change'));

    expect(elements.toneRate.value).toBe('0.9');
    expect(speechManagerMock.testVoice).toHaveBeenCalledWith(1.2, 0.9);
  });

  test('updateNumberInput should set input value correctly', () => {
    const uiManager = new UiManager(speechManagerMock, modeManagerMock);
    const numberInput = document.createElement('input');
    const slider = { value: '2.5' };

    uiManager.updateNumberInput(slider, numberInput);
    expect(numberInput.value).toBe('2.5');
  });

  test('updateSlider should set slider value correctly', () => {
    const uiManager = new UiManager(speechManagerMock, modeManagerMock);
    const slider = document.createElement('input');
    const input = { value: '1.7' };

    uiManager.updateSlider(input, slider);
    expect(slider.value).toBe('1.7');
  });

  test('setActiveButton should remove active class from other buttons', () => {
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    button1.classList.add('button-style', 'active');
    button2.classList.add('button-style');
    document.body.appendChild(button1);
    document.body.appendChild(button2);

    const uiManager = new UiManager(speechManagerMock, modeManagerMock);
    uiManager.setActiveButton(button2);

    expect(button1.classList.contains('active')).toBe(false);
    expect(button2.classList.contains('active')).toBe(true);
  });

  test('changing both rate and pitch should call testVoice with new values', () => {
    new UiManager(speechManagerMock, modeManagerMock);

    elements.speechRate2.value = '1.8';
    elements.speechRate2.dispatchEvent(new Event('input'));

    elements.toneRate.value = '0.6';
    elements.toneRate.dispatchEvent(new Event('input'));

    expect(speechManagerMock.testVoice).toHaveBeenLastCalledWith(1.8, 0.6);
  });

  test('focusing unrelated element does not trigger speechManager.speak', () => {
    const unrelated = document.createElement('input');
    document.body.appendChild(unrelated);

    new UiManager(speechManagerMock, modeManagerMock);
    unrelated.dispatchEvent(new Event('focus'));

    expect(speechManagerMock.speak).not.toHaveBeenCalledWith(expect.stringMatching(/Режим|Кнопка/));
  });
});
