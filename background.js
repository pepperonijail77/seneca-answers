const browser = self.browser || self.chrome;

browser.webRequest.onCompleted.addListener((details) => {
    if (details.method === 'GET') {
        browser.tabs.sendMessage(details.tabId, {url: details.url}).catch(e => console.error(e));
        console.log(`Url: ${details.url}`);
    }
}, {urls: ['https://course-cdn-v2.app.senecalearning.com/api/courses/*/sections/*']});