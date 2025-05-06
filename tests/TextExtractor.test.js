const TextExtractor = require('../js/TextExtractor'); // Adjust the path accordingly

describe('TextExtractor', () => {
  let textExtractor;

  beforeEach(() => {
    textExtractor = new TextExtractor();
  });

  describe('getPageText', () => {
    it('should return trimmed text of the document body', () => {
      document.body.innerText = ' Some text content ';
      const result = textExtractor.getPageText();
      expect(result).toBe('Some text content');
    });
  });

  describe('getTextFromPageElement', () => {
    it('should return innerText trimmed from an HTML element', () => {
      const element = document.createElement('div');
      element.innerText = 'Element text';
      const result = textExtractor.getTextFromPageElement(element);
      expect(result).toBe('Element text');
    });

    it('should return alt text if innerText is not available', () => {
      const element = document.createElement('img');
      element.alt = 'Image description';
      const result = textExtractor.getTextFromPageElement(element);
      expect(result).toBe('Image description');
    });

    it('should return title text if innerText and alt are not available', () => {
      const element = document.createElement('img');
      element.title = 'Image title';
      const result = textExtractor.getTextFromPageElement(element);
      expect(result).toBe('Image title');
    });

    it('should return an empty string if element is not an HTMLElement', () => {
      const result = textExtractor.getTextFromPageElement({});
      expect(result).toBe('');
    });
  });

  describe('getSelectedText', () => {
    it('should return selected text from the window', () => {
      window.getSelection = jest.fn().mockReturnValue({ toString: () => 'Selected text' });
      const result = textExtractor.getSelectedText();
      expect(result).toBe('Selected text');
    });

    it('should return an empty string if there is no selection', () => {
      window.getSelection = jest.fn().mockReturnValue({ toString: () => '' });
      const result = textExtractor.getSelectedText();
      expect(result).toBe('');
    });
  });
});
