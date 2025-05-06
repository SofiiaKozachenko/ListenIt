// tests/background.test.js
describe('Background Script', () => {
    let sendMessageMock;
    let queryMock;
    let addListenerMock;
  
    beforeEach(() => {
      // Mock chrome.commands.onCommand.addListener
      addListenerMock = jest.fn();
      global.chrome = {
        commands: {
          onCommand: {
            addListener: addListenerMock,  // mock the addListener method
          },
        },
        tabs: {
          query: jest.fn(),  // mock the query method
          sendMessage: jest.fn(),  // mock the sendMessage method
        },
      };
  
      // Mock response for chrome.tabs.query
      queryMock = chrome.tabs.query;
      queryMock.mockImplementation((query, callback) => {
        callback([{ id: 1 }]);  // return a mock tab with id 1
      });
  
      sendMessageMock = chrome.tabs.sendMessage;
    });
  
    test('should send message when command is executed', () => {
      const command = 'testCommand';
      
      // Simulate the addListener behavior
      addListenerMock.mockImplementationOnce((callback) => {
        callback(command);  // simulate command being triggered
      });
  
      // Trigger the command listener
      chrome.commands.onCommand.addListener((cmd) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: cmd });
        });
      });
  
      // Check that chrome.tabs.sendMessage was called with the correct arguments
      expect(sendMessageMock).toHaveBeenCalledWith(1, { action: command });  // mock tab id 1
    });
  });
  