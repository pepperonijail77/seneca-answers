const browser = self.browser || self.chrome;

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'signedUrl') {
        fetch('https://seneca.ellsies.tech/api/courses/' + message.course + '/signed-url?sectionId=' + message.section)
            .then(r => r.json())
            .then(d => sendResponse({success: true, data: d.url}))
            .catch(e => sendResponse({success: false, error: e.message}));
        return true;
    } else if (message.type === 'seneca') {
        fetch(message.url)
            .then(r => r.json())
            .then(d => sendResponse({success: true, data: d}))
            .catch(e => sendResponse({success: false, error: e.message}));
        return true;
    }
    return false;
});