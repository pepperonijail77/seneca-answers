const brow = typeof browser === 'undefined' ? window.chrome : browser;

browser.declarativeNetRequest.updateDynamicRules({
	removeRuleIds: [1, 2],
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
		{
			id: 2,
			priority: 1,
			action: {
				type: 'modifyHeaders',
				requestHeaders: [
					{header: 'Origin', operation: 'set', value: 'https://app.senecalearning.com'},
					{header: 'Referer', operation: 'set', value: 'https://app.senecalearning.com/'},
				],
			},
			condition: {
				requestDomains: ['stats.app.senecalearning.com'],
				resourceTypes: ['xmlhttprequest'],
			},
		},
	],
});

browser.webRequest.onSendHeaders.addListener(
	details => {
		if (details.method === 'GET' && details.requestHeaders.some(h => h.name === 'access-key')) {
			browser.tabs
				.sendMessage(details.tabId, {
					type: 'signedUrl',
					url: details.url,
					accessToken: details.requestHeaders.find(h => h.name === 'access-key').value,
				})
				.catch(e => console.error(e));
			console.log(details.url);
		}
	},
	{
		urls: [
			'https://course-cdn-v2.app.senecalearning.com/api/courses/*/sections/*',
			// 'https://short-answer.app.senecalearning.com/api/questions/query?*',
		],
	},
	['requestHeaders']
);

browser.webRequest.onSendHeaders.addListener(
	details =>
		browser.tabs
			.sendMessage(details.tabId, {type: 'websocket', url: details.url})
			.catch(e => console.error(e)),
	{urls: ['wss://session-ws.app.senecalearning.com/*']}
);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	switch (message.type) {
		case 'accessToken': {
			fetch(`https://securetoken.googleapis.com/v1/token?key=${message.apiKey}`, {
				method: 'POST',
				body: `{\"grant_type\":\"refresh_token\",\"refresh_token\":\"${message.refreshToken}\"}`,
			})
				.then(r => r.json())
				.then(d => sendResponse({success: true, accessToken: d.access_token}))
				.catch(e => sendResponse({success: false, error: e.message}));
			return true;
		}
		case 'userId': {
			fetch('https://user-info.app.senecalearning.com/api/user-info/me', {
				headers: {
					'access-key': message.accessToken,
					correlationId: `${Date.now()}::${crypto.randomUUID()}`,
					// Origin: 'https://app.senecalearning.com',
				},
			})
				.then(r => r.json())
				.then(d => sendResponse({success: true, userId: d.userId}))
				.catch(e => sendResponse({success: false, error: e.message}));
			return true;
		}
		case 'signedUrl': {
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
			return true;
		}
		case 'assignment': {
			fetch(
				`https://assignments.app.senecalearning.com/api/students/me/assignments?limit=100&assignmentId=${message.assignmentId}`,
				{
					headers: {
						'access-key': message.accessToken,
						correlationId: `${Date.now()}::${crypto.randomUUID()}`,
					},
				}
			)
				.then(r => r.json())
				.then(d => {
					sendResponse({success: true, assignments: d.items});
				})
				.catch(e => sendResponse({success: false, error: e.message}));
			return true;
		}
		case 'examQuestions': {
			fetch(
				`https://short-answer.app.senecalearning.com/api/questions/query?courseId=${message.courseId}${message.sectionId ? '&sectionId=' + message.sectionId : ''}&enrich=question`,
				{
					headers: {
						'access-key': message.accessToken,
						correlationId: `${Date.now()}::${crypto.randomUUID()}`,
					},
				}
			)
				.then(r => r.json())
				.then(d => {
					sendResponse({success: true, examQuestions: d.items});
				})
				.catch(e => sendResponse({success: false, error: e.message}));
			return true;
		}
		case 'completeContent': {
			fetch('https://stats.app.senecalearning.com/api/stats/sessions', {
				method: 'POST',
				headers: {
					'access-key': message.accessToken,
					'Content-Type': 'application/json',
					correlationId: `${Date.now()}::${crypto.randomUUID()}`,
					// Origin: 'https://app.senecalearning.com',
					// Referer: 'https://app.senecalearning.com/',
					'user-region': 'GB',
				},
				body: JSON.stringify(message.body),
			})
				.then(r => sendResponse({success: true}))
				.catch(e => {
					if (e.status === 401) sendResponse({success: false, error: 401});
					else sendResponse({success: false, error: e.message});
				});
			return true;
		}
		default:
			return false;
	}
});
