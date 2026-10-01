const brow = typeof browser === 'undefined' ? window.chrome : browser;

const signedUrls = {};
const keys = {};

function updateAnswers(seneca) {
	result.innerHTML = 'Loading...';

	const answers = [];
	for (let content of seneca.contents) {
		for (let module of content.contentModules) {
			answers.push(module);
		}
	}

	result.innerHTML = '';
	for (let answer of answers) {
		const row = result.appendChild(document.createElement('tr'));
		switch (answer.moduleType) {
			case 'concept':
			case 'delve':
			case 'flashcard':
			case 'hierarchy':
			case 'hyper-flashcard':
			case 'image':
			case 'pattern':
			case 'text-block':
			case 'video': {
				row.remove();
				break;
			}
			case 'equation': {
				row.innerHTML = `<h3>Equation</h3><p>${answer.content.wordfillSentence}</p>`;
				break;
			}
			case 'exact-list':
			case 'list':
			case 'mindmap': {
				const sentences = [];
				for (let i of answer.content.values) {
					let sentence = [];
					for (let j of i.value) {
						if (typeof j === 'string') sentence.push(j);
						else if (typeof j === 'object') sentence.push(`<u>${j.word}</u>`);
					}
					sentences.push(sentence.join(''));
				}
				row.innerHTML = `<h3>${
					answer.moduleType === 'list'
						? 'List'
						: answer.moduleType === 'exact-list'
							? 'Exact List'
							: 'Mind map'
				}</h3><p><strong>${
					answer.content.statement
				}</strong></p><p>${sentences.join('<br><br>')}</p>`;
				break;
			}
			case 'flow': {
				row.innerHTML = `<h3>Flow</h3><p>${answer.content.title}</p>`; // <p>${answer.content.orderedValues.join('<br>')}</p>`;
				const table = row.appendChild(document.createElement('table'));
				table.appendChild(document.createElement('tbody')).innerHTML =
					`<tr>${answer.content.orderedValues.join('</tr><tr>')}</tr>`;
				break;
			}
			case 'grid': {
				const grid = [];
				for (let i of answer.content.definitions) {
					let sentence = [];
					for (let word of i.word) {
						if (typeof word === 'string') sentence.push(word);
						else if (typeof word === 'object') sentence.push(word.caps || word.word);
					}
					grid.push(`<tr><td>${sentence.join('')}</td><td>${i.text}</td></tr>`);
				}
				row.innerHTML = `<h3>Grid</h3>`;
				const table = row.appendChild(document.createElement('table'));
				table.innerHTML = `${grid.join('')}`;
				break;
			}
			case 'image-description':
			case 'wordfill': {
				const sentence = [];
				for (let word of answer.content.words) {
					if (typeof word === 'string') sentence.push(word);
					else if (typeof word === 'object')
						sentence.push(`<u>${word.word.split('__')[1] || word.word}</u>`);
				}
				row.innerHTML = `<h3>${
					answer.moduleType === 'wordfill' ? 'Wordfill' : 'Image Description'
				}</h3><p>${sentence.join('')}</p>`;
				break;
			}
			case 'image-label': {
				const labels = [];
				for (let label of answer.content.labels) {
					if (label.word.isMixedDefinition) labels.push(label.word.processedWord[0].caps);
					else labels.push(label.word.caps);
				}
				row.innerHTML = `<h3>Image Label</h3><p>${
					answer.content.title
				}</p><p>${labels.join('<br>')}</p>`;
				break;
			}
			case 'image-list': {
				const images = [];
				const values = [];
				for (let value of answer.content.values) {
					images.push(
						`<img src="https://image-v2.cdn.app.senecalearning.com/${
							value.imgURL.split('///')[1]
						}" alt="${value.imgURL.split('/').at(-1)}">`
					);
					values.push('');
					for (let val of value.value) {
						if (typeof val === 'string') values[values.length - 1] += val;
						else if (typeof val === 'object') values[values.length - 1] += val.word;
					}
				}
				row.innerHTML = `<h3>Image List</h3>`;
				const details = row.appendChild(document.createElement('details'));
				details.innerHTML = `<summary>${answer.content.statement || seneca.title}</summary>`;
				for (let i = 0; i < images.length; i++) {
					const span = details.appendChild(document.createElement('span'));
					span.innerHTML = images[i] + values[i] + '<br><br>';
				}
				break;
			}
			case 'image-multi-choice': {
				const imageUrls = [];
				for (let value of answer.content.values) {
					if (value.isCorrect) imageUrls.push(value.image);
				}
				const images = [];
				for (let url of imageUrls) {
					images.push(
						`<img src="https://image-v2.cdn.app.senecalearning.com/${
							url.split('///')[1]
						}" alt="${url.split('/').at(-1)}">`
					);
				}
				row.innerHTML = `<h3>Image Multiple Choice</h3><p>${
					answer.content.title
				}</p><p>${images.join('')}</p>`;
				break;
			}
			case 'multiple-choice': {
				row.innerHTML = `<h3>Multiple Choice</h3><p>${answer.content.question}</p><p>${answer.content.correctAnswer}</p>`;
				break;
			}
			case 'multiSelect': {
				const correct = [];
				for (let option of answer.content.options) {
					if (option.correct === true) correct.push(option.text);
				}
				row.innerHTML = `<h3>Multi Select</h3><p>${
					answer.content.question
				}</p><p>${correct.join('<br>')}</p>`;
				break;
			}
			case 'simple-calculation': {
				row.innerHTML = `<h3>Simple Calculation</h3><p>${answer.content.answersTemplate}</p>`;
				break;
			}
			case 'toggles': {
				const toggles = [];
				for (let i of answer.content.toggles) {
					toggles.push(i.correctToggle);
				}
				row.innerHTML = `<h3>Toggles</h3><p>${
					answer.content.statement
				}</p><p>${toggles.join('<br>')}</p>`;
				break;
			}
			case 'worked-example': {
				const steps = [];
				for (let i of answer.content.steps) {
					for (let j of i.equation) {
						if (typeof j === 'object') steps.push(j.word);
					}
				}
				row.innerHTML = `<h3>Worked Example</h3><p>${steps.join('<br>')}</p>`;
				break;
			}
			case 'wrong-word': {
				const sentence = [];
				for (let i of answer.content.sentence) {
					if (typeof i === 'string') sentence.push(i);
					else if (typeof i === 'object') sentence.push(`<u>${i.word}</u>`);
				}
				row.innerHTML = `<h3>Wrong Word</h3><p>${sentence.join('')}</p>`;
				break;
			}
			default: {
				row.innerHTML = `<h3>${answer.moduleType}</h3><p>${JSON.stringify(answer)}</p>`;
			}
		}
	}
}

function updateMarkSchemes(questions) {
	result.innerHTML = '';

	// const markSchemes = [];
	for (let question of questions) {
		const row = result.appendChild(document.createElement('tr'));
		const markScheme = question.markScheme
			.replace(/\*\*(.+?)\*\*/gm, (_, content) => `<strong>${content}</strong>`)
			.replace(/<?(\/?)[Mm]ark>/gm, (_, slash) => `<${slash}em>`);
		row.innerHTML = `<h3>${question.questionText}</h3><p>${markScheme}</p>`;
	}
}

function extractKeys() {
	return new Promise((resolve, reject) => {
		try {
			const req = indexedDB.open('firebaseLocalStorageDb', 1);

			req.onerror = event => {
				console.error('Failed to open database:', event.target.error);
				reject(event.target.error);
			};

			req.onsuccess = event => {
				const db = event.target.result;
				const transaction = db.transaction('firebaseLocalStorage', 'readonly');
				const store = transaction.objectStore('firebaseLocalStorage');
				const query = store.getAll();

				transaction.oncomplete = () => {
					db.close();
				};

				query.onerror = event => {
					console.error('Failed to extract keys:', event.target.error);
					reject(event.target.error);
				};

				query.onsuccess = () => {
					const result = query.result[0].value;
					keys.userId = result.uid;
					keys.refreshToken = result.stsTokenManager.refreshToken;
					keys.accessToken = result.stsTokenManager.accessToken;
					keys.apiKey = result.apiKey;
					keys.countryCode = JSON.parse(localStorage.getItem('seneca.geoRegion')).countryCode;

					resolve();
				};
			};
		} catch (error) {
			reject(error);
		}
	});
}

async function getAccessToken() {
	if (!keys.apiKey || !keys.refreshToken) await extractKeys();

	await brow.runtime
		.sendMessage({type: 'accessToken', apiKey: keys.apiKey, refreshToken: keys.refreshToken})
		.then(r => {
			if (r.success) keys.accessToken = r.accessToken;
			else console.error('Error getting access token: ' + r.error);
		})
		.catch(e => console.error('Error getting access token: ' + e.message));
}

async function getSignedUrl(courseId, sectionId) {
	if (!keys.accessToken) await extractKeys();

	return await brow.runtime
		.sendMessage({type: 'signedUrl', courseId, sectionId, accessToken: keys.accessToken})
		.then(r => {
			if (r.success) return r.url;
			else console.error('Error getting signed URL: ' + r.error);
		})
		.catch(e => console.error('Error getting signed URL: ' + e.message));
}

async function getAssignment(assignmentId) {
	if (!keys.accessToken) await extractKeys();

	return await brow.runtime
		.sendMessage({type: 'assignment', assignmentId, accessToken: keys.accessToken})
		.then(r => {
			if (r.success) return r.assignments[0];
			else console.error('Error getting assignments: ' + e.message);
		})
		.catch(e => console.error('Error getting assignments: ' + e.message));
}

async function getExamQuestions(courseId, sectionId = null) {
	if (!keys.accessToken) await extractKeys();

	return await brow.runtime
		.sendMessage({type: 'examQuestions', courseId, sectionId, accessToken: keys.accessToken})
		.then(r => {
			if (r.success) return r.examQuestions;
			else console.error('Error getting exam questions: ' + e.message);
		})
		.catch(e => console.error('Error getting exam questions: ' + e.message));
}

function generateTimes(min, max, count) {
	let time = new Date();
	const times = [time.toISOString().replace(/\.\d{3}Z$/, '+00:00')];

	for (let i = 0; i < count; i++) {
		const duration = Math.floor(Math.random() * (max - min + 1) + min);
		time = new Date(time.getTime() - duration * 1000);
		times.unshift(time.toISOString().replace(/\.\d{3}Z$/, '+00:00'));
	}

	return times;
}

async function completeContent(courseId, sectionId, content, medianTime = null) {
	if (!keys.accessToken || !keys.userId || !keys.countryCode) await extractKeys();

	const sessionId = crypto.randomUUID();
	const contentModules = content.contentModules || [];
	const times = medianTime
		? generateTimes(
				Math.ceil(0.9 * medianTime) / contentModules.length,
				Math.floor(1.1 * medianTime) / contentModules.length,
				contentModules.length
			)
		: generateTimes(5, 13, contentModules.length);

	let questions = 0;
	const modules = contentModules.map((module, idx) => {
		const isQuestion = ![
			'concept',
			'delve',
			'flashcard',
			'hierarchy',
			'hyper-flashcard',
			'image',
			'pattern',
			'text-block',
			'video',
		].includes(module.moduleType);
		if (isQuestion) questions++;

		const moduleData = {
			sessionId,
			moduleOrder: idx,
			moduleId: module.id,
			moduleType: module.moduleType,
			timeStarted: times[idx],
			timeFinished: times[idx + 1],
			gaveUp: false,
			submitted: isQuestion,
			completed: true,
			testingActive: isQuestion,
			content: {},
			score: isQuestion ? 1 : 0,
			moduleScore: {score: 1},
			userAnswer: module.moduleType === 'toggles' ? [] : {},
			courseId,
			sectionId,
			contentId: content.id,
		};

		if (!isQuestion) {
			delete moduleData.moduleScore;
			delete moduleData.userAnswer;
		}

		return moduleData;
	});

	const body = {
		platform: 'seneca',
		clientVersion: '4.0.0',
		userId: keys.userId,
		session: {
			sessionId,
			courseId,
			timeStarted: times[0],
			timeFinished: times[times.length - 1],
			startingProficiency: 0,
			endingProficiency: 1, // 0.5,
			startingCourseProficiency: Math.random() * 0.05,
			endingCourseProficiency: Math.random() * 0.05 + 0.05,
			endingCourseScore: Math.random() * 0.05 + 0.05,
			sessionScore: 1,
			completed: true,
			modulesCorrect: questions,
			modulesIncorrect: 0,
			averageScore: 1,
			modulesGaveUp: 0,
			modulesStudied: contentModules.length,
			modulesTested: questions,
			sessionType: 'adaptive',
			sectionIds: [sectionId],
			contentIds: [content.id],
			options: {hasHardestQuestionContent: content.contentType === 'hardestQuestions'},
		},
		modules,
	};

	const response = await brow.runtime.sendMessage({
		type: 'completeContent',
		body,
		accessToken: keys.accessToken,
		countryCode: keys.countryCode,
	});
	if (!response.success) {
		await getAccessToken();
		await brow.runtime
			.sendMessage({type: 'completeContent', body, accessToken: keys.accessToken})
			.catch(e => console.error('Error autocompleting section: ' + e.error));
	}
}

async function completeSection(courseId, sectionId) {
	const signedUrl = signedUrls[sectionId] || (await getSignedUrl(courseId, sectionId));
	let section;
	await fetch(signedUrl)
		.then(r => r.json())
		.then(d => {
			signedUrls[d.id] = signedUrl;
			section = d;
		})
		.catch(e => console.error(e));

	for (let content of section.contents) {
		await completeContent(
			courseId,
			sectionId,
			content,
			section?.medianStudyTimeSecs / section.contents.length
		);
	}
}

const overlay = document.body.appendChild(document.createElement('div'));
overlay.id = 'overlay';
overlay.innerHTML = `<div id="overlay-content">
	<button id="complete">Complete</button>
	<button id="update">Update</button>
	<button id="move">Move</button>
	<button id="close">X</button>
	<div>
		<table id="result">
		</table>
	</div>
</div>`;
const result = document.getElementById('result');

// Refresh
document.getElementById('update').addEventListener('click', async function () {
	this.innerText = 'Updating…';

	const url = window.location.href.split('/');

	if (url[6] === 'exam-questions') {
		getExamQuestions(url[5])
			.then(d => updateMarkSchemes(d))
			.catch(e => console.error('Error getting exam questions: ' + e.message));
	} else {
		const signedUrl = signedUrls[url[7]] || (await getSignedUrl(url[5], url[7]));
		fetch(signedUrl)
			.then(r => r.json())
			.then(d => {
				signedUrls[d.id] = signedUrl;
				updateAnswers(d);
			})
			.catch(e => console.error('Error getting signed URL: ' + e.message));
	}

	this.innerText = 'Update';
});

// Complete
document.getElementById('complete').addEventListener('click', async function () {
	this.innerText = 'Completing…';

	const url = window.location.href.split('/');

	if (url[6] === 'section') {
		await completeSection(url[5], url[7]);
	} else if (url[5] === 'assignment') {
		let assignment, prev;
		let incomplete = -1;
		const sleep = ms => new Promise(r => setTimeout(r, ms));

		while (incomplete !== 0) {
			assignment = await getAssignment(url[6]);
			prev = incomplete;
			incomplete = 0;

			for (let task of assignment.spec.tasks) {
				if (assignment.taskStats[task.id]?.score === 1) continue;
				if (task.resourceType === 'section') {
					incomplete++;
					await sleep(100);
					await completeSection(task.courseId, task.sectionId);
				}
			}

			if (incomplete === prev) {
				result.innerText = 'Partially done, reload the page and press complete again to continue.';
				break;
			}

			await sleep(3000);
		}
	}

	this.innerText = 'Complete';
});

// Move
(function (elt, move) {
	let pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;
	move.onmousedown = dragMouseDown;

	function dragMouseDown(e) {
		move.style.cursor = 'grabbing';
		e = e || window.event;
		e.preventDefault();
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		elt.style.top = elt.offsetTop - pos2 + 'px';
		elt.style.right = document.body.offsetWidth - elt.offsetWidth - elt.offsetLeft + pos1 + 'px';
	}

	function closeDragElement() {
		move.style.cursor = 'grab';
		document.onmouseup = null;
		document.onmousemove = null;
	}
})(document.getElementById('overlay'), document.getElementById('move'));

// Close
document.getElementById('close').addEventListener('click', () => {
	document.getElementById('overlay').hidden = true;
});

document.addEventListener(
	'paste',
	e => {
		e.stopImmediatePropagation();
	},
	true
);

brow.runtime.onMessage.addListener(message => {
	if (message.type === 'signedUrl') {
		const url = window.location.href.split('/');
		keys.accessToken = message.accessToken;

		if (url[6] === 'exam-questions') {
			getExamQuestions(url[5], message.url.split(/[\/\?]/)[7])
				.then(d => updateMarkSchemes(d))
				.catch(e => console.error(e));
		} else {
			fetch(message.url)
				.then(r => r.json())
				.then(d => {
					signedUrls[d.id] = message.url;
					updateAnswers(d);
				})
				.catch(e => console.error(e));
		}
	} else if (message.type === 'websocket') {
		keys.accessToken = /access-key=(.+?)(&|$)/.exec(message.url)[1];
		keys.sessionId = /sessionId=(.+?)(&|$)/.exec(message.url)[1];
	}
});
