console.log('content.js script loaded');

(async () => {
  console.log('Starting full page screenshot capture');

  const captureFullPage = async (element) => {
    const getPageHeight = (el) => {
      return Math.max(
        el.scrollHeight,
        el.offsetHeight,
        el.clientHeight
      );
    };

    const scrollTo = (el, x, y) => {
      return new Promise((resolve) => {
        el.scrollTo(x, y);
        setTimeout(resolve, 100); // Wait for the scroll to complete
      });
    };

    const captureVisible = () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'captureScreenshot' }, (response) => {
          if (response.success) {
            resolve(response.dataUrl);
          } else {
            console.error('Error capturing screenshot:', response.error);
            resolve(null);
          }
        });
      });
    };

    const pageHeight = getPageHeight(element);
    const viewportHeight = element.clientHeight;
    const screenshots = [];

    for (let y = 0; y < pageHeight; y += viewportHeight) {
      await scrollTo(element, 0, y);
      const screenshot = await captureVisible();
      if (screenshot) {
        screenshots.push(screenshot);
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Add a delay to avoid exceeding the quota
    }

    return screenshots;
  };

  const isVisible = (el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  const isRelevant = (el) => {
    // Add more conditions to filter out irrelevant elements
    return el.tagName !== 'A' && el.tagName !== 'SPAN' && el.tagName !== 'BUTTON';
  };

  const scrollableElements = Array.from(document.querySelectorAll('*'))
    .filter(el => el.scrollHeight > el.clientHeight && isVisible(el) && isRelevant(el));
  console.log(`Found ${scrollableElements.length} scrollable elements`);

  for (const element of scrollableElements) {
    console.log(`Capturing screenshots for element:`, element);
    await captureFullPage(element);
  }
})();