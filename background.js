let screenshots = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureScreenshot') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
      screenshots.push(dataUrl);
      sendResponse({ success: true, dataUrl: dataUrl });
    });
    return true; // Indicate that the response will be sent asynchronously
  } else if (message.action === 'solveScreenshots') {
    // Send the screenshots to the server
    fetch('https://your-server.com/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ screenshots })
    })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch(error => console.error('Error:', error));
  }
});