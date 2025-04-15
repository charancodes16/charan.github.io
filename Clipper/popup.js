function saveReading(title, url, notes, date) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = 'Saving...';
    statusElement.className = 'status';
    
    // Create reading item object
    const readingItem = {
      title: title,
      url: url,
      notes: notes,
      date: date,
      id: Date.now() // Use timestamp as unique ID
    };
    
    // Get existing readings
    chrome.storage.local.get(['readings'], function(result) {
      const readings = result.readings || [];
      
      // Add new reading
      readings.unshift(readingItem);
      
      // Save updated readings
      chrome.storage.local.set({readings: readings}, function() {
        statusElement.textContent = 'Saved successfully!';
        statusElement.className = 'status success';
        
        // Clear form
        document.getElementById('notes').value = '';
        
        // Close popup after delay
        setTimeout(function() {
          window.close();
        }, 1500);
      });
    });
  }