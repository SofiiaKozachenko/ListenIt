export default class ModeManager {
    constructor(speechManager, textExtractor, contentObserver) {
      this.speechManager = speechManager;
      this.textExtractor = textExtractor;
      this.contentObserver = contentObserver;
      this.mode = 'tab';
  
      this.handleMouseOver = this.handleMouseOver.bind(this);
      this.handleTabFocus = this.handleTabFocus.bind(this);
      this.handleTextSelection = this.handleTextSelection.bind(this);
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
        settings.mode = this.mode;
  
        chrome.storage.sync.set({ settings }, () => {
          console.log(`Mode changed to: ${this.mode}`);
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0) {
              chrome.tabs.reload(tabs[0].id);
            }
          });
        });
      });
      this.applyEventListeners();
    }
  
    applyEventListeners() {
      document.removeEventListener("mouseover", this.handleMouseOver);
      document.removeEventListener("focusin", this.handleTabFocus);
      document.removeEventListener("mouseup", this.handleTextSelection);
  
      if (this.mode === 'hover') {
        document.addEventListener("mouseover", this.handleMouseOver);
        document.addEventListener("focusin", this.handleTabFocus);
      } else if (this.mode === 'readPage') {
        window.addEventListener("load", () => {
          this.observeAndReadPageContent();
        });
        document.addEventListener("focusin", this.handleTabFocus);
      } else if (this.mode === 'selection') {
        document.addEventListener("mouseup", this.handleTextSelection);
        document.addEventListener("focusin", this.handleTabFocus);
      } else {
        document.addEventListener("focusin", this.handleTabFocus);
      }
    }
  
    handleMouseOver(event) {
      const target = event.target;
      const text = this.textExtractor.getTextFromPageElement(target);
      if (text && text.length <= 1500) {
        this.speechManager.speak(text);
      }
    }
  
    handleTabFocus(event) {
      const target = event.target;
      const text = this.textExtractor.getTextFromPageElement(target);
      if (text) {
        this.speechManager.speak(text);
      }
    }
  
    handleTextSelection() {
      if (!this.textExtractor) {
        console.error("textExtractor is undefined");
        return;
      }
      const selectedText = this.textExtractor.getSelectedText();
      if (selectedText) {
        this.speechManager.speak(selectedText);
      }
    }
  }
  