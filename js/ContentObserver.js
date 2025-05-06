export default class ContentObserver {
//class ContentObserver {
    constructor(callback) {
      this.observer = new MutationObserver(callback);
    }
  
    observeChanges(element, options = { childList: true, subtree: true }) {
      this.observer.observe(element, options);
    }
  
    disconnectObserver() {
      this.observer.disconnect();
    }

    observeAndReadPageContent() {
        removeAds();
        readPageContent();
        contentObserver.observeChanges(document.body);
    }
}

//module.exports = ContentObserver;
window.ContentObserver = ContentObserver;