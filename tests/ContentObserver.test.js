// ContentObserver.test.js

const ContentObserver = require('../js/ContentObserver');

// Mock removeAds and readPageContent directly
const removeAds = jest.fn();
const readPageContent = jest.fn();

describe('ContentObserver', () => {
  let contentObserver;
  let mockMutationObserver;

  beforeEach(() => {
    // Mock MutationObserver
    mockMutationObserver = jest.fn().mockImplementation(callback => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
    }));

    // Replace the real MutationObserver with the mock
    global.MutationObserver = mockMutationObserver;

    // Create an instance of ContentObserver
    contentObserver = new ContentObserver(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize MutationObserver with callback', () => {
    expect(mockMutationObserver).toHaveBeenCalledTimes(1);
    expect(mockMutationObserver).toHaveBeenCalledWith(expect.any(Function));
  });

  test('should observe changes when observeChanges is called', () => {
    const element = document.createElement('div');
    const options = { childList: true, subtree: true };

    contentObserver.observeChanges(element, options);

    const observerInstance = mockMutationObserver.mock.calls[0][0];
    const observerMock = observerInstance.observe;

    expect(observerMock).toHaveBeenCalledWith(element, options);
  });

  test('should disconnect observer when disconnectObserver is called', () => {
    contentObserver.disconnectObserver();

    const observerInstance = mockMutationObserver.mock.calls[0][0];
    const observerMock = observerInstance.disconnect;

    expect(observerMock).toHaveBeenCalledTimes(1);
  });

  test('should call removeAds, readPageContent, and observeChanges in observeAndReadPageContent', () => {
    // Spy on the methods
    const observeChangesSpy = jest.spyOn(contentObserver, 'observeChanges');

    contentObserver.observeAndReadPageContent();

    expect(removeAds).toHaveBeenCalledTimes(1);
    expect(readPageContent).toHaveBeenCalledTimes(1);
    expect(observeChangesSpy).toHaveBeenCalledWith(document.body);
  });
});
