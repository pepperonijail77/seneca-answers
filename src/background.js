const browser = self.browser || self.chrome;

browser.declarativeNetRequest.updateDynamicRules({
	removeRuleIds: [1],
	addRules: [
		{
			id: 1,
			priority: 1,
			action: {
				type: 'modifyHeaders',
				requestHeaders: [
					{header: 'Origin', operation: 'set', value: 'https://app.senecalearning.com'},
				],
			},
			condition: {
				requestDomains: ['course.app.senecalearning.com', 'user-info.app.senecalearning.com'],
				resourceTypes: ['xmlhttprequest'],
			},
		},
	],
});

browser.webRequest.onSendHeaders.addListener(
	details => {
		if (details.method === 'GET' && details.requestHeaders.some(h => h.name === 'access-key')) {
			browser.tabs.sendMessage(details.tabId, {url: details.url}).catch(e => console.error(e));
			console.log(details.url);
		}
	},
	{urls: ['https://course-cdn-v2.app.senecalearning.com/api/courses/*/sections/*']},
	['requestHeaders']
);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'accessToken') {
		fetch(`https://securetoken.googleapis.com/v1/token?key=${message.apiKey}`, {
			method: 'POST',
			body: `{\"grant_type\":\"refresh_token\",\"refresh_token\":\"${message.refreshToken}\"}`,
		})
			.then(r => r.json())
			.then(d => sendResponse({success: true, accessToken: d.access_token}))
			.catch(e => sendResponse({success: false, error: e.message}));
	} else if (message.type === 'userId') {
		fetch('https://user-info.app.senecalearning.com/api/user-info/me', {
			headers: {
				'access-key': message.accessToken,
				correlationId: `${Date.now()}::${crypto.randomUUID()}`,
			},
		})
			.then(r => r.json())
			.then(d => sendResponse({success: true, userId: d.userId}))
			.catch(e => sendResponse({success: false, error: e.message}));
	} else if (message.type === 'signedUrl') {
		fetch(
			`https://course.app.senecalearning.com/api/courses/${message.courseId}/signed-url?sectionId=${message.sectionId}&contentTypes=standard,hardestQuestions`,
			{
				headers: {
					'access-key': message.accessToken,
					correlationId: `${Date.now()}::${crypto.randomUUID()}`,
					// Origin: 'https://app.senecalearning.com',
				},
			}
		)
			.then(r => r.json())
			.then(d => {
				console.log(d.url);
				sendResponse({success: true, url: d.url});
			})
			.catch(e => sendResponse({success: false, error: e.message}));
	} else return false;
	return true;
});
