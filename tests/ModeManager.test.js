const ModeManager = require('../js/ModeManager');

describe('ModeManager', () => {
  let speechManagerMock;
  let modeManager;

  beforeEach(() => {
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn((key, callback) => callback({ settings: {} })),
          set: jest.fn((data, callback) => callback && callback())
        }
      },
      tabs: {
        query: jest.fn((query, callback) => callback([{ id: 1 }])),
        reload: jest.fn()
      }
    };

    speechManagerMock = {};
    modeManager = new ModeManager(speechManagerMock);
  });

  it('повертає початковий режим "tab"', () => {
    expect(modeManager.getMode()).toBe('tab');
  });

  it('активує hover режим', () => {
    modeManager.activateHoverMode();
    expect(modeManager.getMode()).toBe('hover');
  });

  it('активує readPage режим', () => {
    modeManager.activateFullPageMode();
    expect(modeManager.getMode()).toBe('readPage');
  });

  it('активує selection режим', () => {
    modeManager.activateSelectedTextMode();
    expect(modeManager.getMode()).toBe('selection');
  });

  it('applyMode зберігає режим і перезавантажує вкладку', () => {
    modeManager.mode = 'hover';
    modeManager.applyMode();

    expect(chrome.storage.sync.set).toHaveBeenCalledWith(
      { settings: { mode: 'hover' } },
      expect.any(Function)
    );

    expect(chrome.tabs.query).toHaveBeenCalled();
    expect(chrome.tabs.reload).toHaveBeenCalledWith(1);
  });

  it('зберігає існуючі налаштування і додає mode', () => {
    chrome.storage.sync.get = jest.fn((key, callback) =>
      callback({ settings: { voice: 'female' } })
    );

    modeManager.mode = 'hover';
    modeManager.applyMode();

    expect(chrome.storage.sync.set).toHaveBeenCalledWith(
      { settings: { voice: 'female', mode: 'hover' } },
      expect.any(Function)
    );
  });

  it('не викликає reload, якщо активних вкладок немає', () => {
    chrome.tabs.query = jest.fn((query, callback) => callback([]));

    modeManager.mode = 'hover';
    modeManager.applyMode();

    expect(chrome.tabs.reload).not.toHaveBeenCalled();
  });

  it('activateHoverMode викликає applyMode', () => {
    const spy = jest.spyOn(modeManager, 'applyMode');
    modeManager.activateHoverMode();
    expect(spy).toHaveBeenCalled();
  });

  it('activateFullPageMode викликає applyMode', () => {
    const spy = jest.spyOn(modeManager, 'applyMode');
    modeManager.activateFullPageMode();
    expect(spy).toHaveBeenCalled();
  });

  it('activateSelectedTextMode викликає applyMode', () => {
    const spy = jest.spyOn(modeManager, 'applyMode');
    modeManager.activateSelectedTextMode();
    expect(spy).toHaveBeenCalled();
  });
});
