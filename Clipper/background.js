chrome.runtime.onInstalled.addListener(function() {
    // Check if API details are already set
    chrome.storage.sync.get(['apiUrl', 'apiKey'], function(data) {
      if (!data.apiUrl || !data.apiKey) {
        // Set default values or open options page
        chrome.storage.sync.set({
          apiUrl: 'http://localhost:3000', // Change this to your actual API URL
          apiKey: '' // This should be set by the user
        });
        
        // Optional: Open options page for configuration
        // chrome.runtime.openOptionsPage();
      }
    });
  });