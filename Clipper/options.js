// Add export functionality
document.getElementById('exportToWebsite').addEventListener('click', function() {
    chrome.storage.local.get(['readings'], function(result) {
      const readings = result.readings || [];
      
      // Create data file content
      const readingsData = JSON.stringify(readings, null, 2);
      
      // Create a download
      const blob = new Blob([readingsData], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'readings.json';
      a.click();
      
      showStatus('Readings exported! Place this file in your website folder.', 'success');
    });
  });