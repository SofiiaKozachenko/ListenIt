export default class ModeManager {
//class ModeManager {
  constructor(speechManager) {
      this.speechManager = speechManager;

      this.mode = 'tab';
  }

  getMode() {
      return this.mode;
  }

  activateHoverMode() {
      this.mode = 'hover';
      this.applyMode();
  }

  activateFullPageMode() {
      this.mode = 'readPage';
      this.applyMode();
  }

  activateSelectedTextMode() {
      this.mode = 'selection';
      this.applyMode();
  }

  applyMode() {
      chrome.storage.sync.get("settings", (data) => {
          const settings = data.settings || {};
          settings.mode = this.mode; // Оновлюємо тільки режим

          chrome.storage.sync.set({ settings }, () => {
              console.log(`Режим змінено на: ${this.mode}`);
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                  if (tabs && tabs.length > 0) {
                      chrome.tabs.reload(tabs[0].id);
                  }
              });
          });
      });
  }

}

//module.exports = ModeManager;
window.ModeManager = ModeManager;