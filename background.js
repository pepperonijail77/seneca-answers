const browser = self.browser || self.chrome;

browser.webRequest.onSendHeaders.addListener(
	details => {
		if (
			details.method === 'GET' &&
			details.requestHeaders.some(h => h.name === 'access-key')
		) {
			browser.tabs
				.sendMessage(details.tabId, {url: details.url})
				.catch(e => console.error(e));
			console.log(`Url: ${details.url}`);
		}
	},
	{
		urls: [
			'https://course-cdn-v2.app.senecalearning.com/api/courses/*/sections/*',
		],
	},
	['requestHeaders']
);
