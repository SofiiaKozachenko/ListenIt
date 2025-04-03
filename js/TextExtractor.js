export default class TextExtractor {
    getPageText() {
      return document.body.innerText.trim();
    }
  
    getTextFromPageElement(element) {
      if (element instanceof HTMLElement) {
        return element.innerText?.trim() || element.alt || element.title;
      }
      return "";
    }
  
    getSelectedText() {
      return window.getSelection().toString().trim();
    }

    readPageContent() {
        const pageText = textExtractor.getPageText();
        if (pageText) {
          speak(pageText);
        }
    }
}
  