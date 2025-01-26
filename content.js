const overlay = document.body.appendChild(document.createElement('div'));
overlay.id = 'overlay';
overlay.innerHTML = `
    <div id="overlay-content">
        <button id="button">Get Answers</button>
        <button id="close">X</button>
        <div>
            <table id="result">
            </table>
        </div>
    </div>
`;

document.getElementById('close').addEventListener('click', () => {
    document.getElementById('overlay').hidden = true;
});

document.getElementById('button').addEventListener('click', async () => {
    const result = document.getElementById('result');
    result.innerText = '';
    const url = document.location.href.split('/');

    const senecaUrl = await browser.runtime.sendMessage({type: 'signedUrl', course: url[5], section: url[7]}).then(r => {
        if (r.success) return r.data;
        else {
            result.textContent = 'Error getting signed url: ' + JSON.stringify(r);
            return 'failed';
        }
    }).catch(e => console.error(e));
    if (senecaUrl === 'failed' || senecaUrl === undefined) return;

    const seneca = await browser.runtime.sendMessage({type: 'seneca', url: senecaUrl}).then(r => {
        if (r.success) return r.data;
        else {
            result.textContent = 'Error getting seneca data: ' + r.error;
            return 'failed';
        }
    }).catch(e => console.error(e));
    if (seneca === 'failed' || seneca === undefined) return;

    const answers = [];
    for (let content of seneca.contents) {
        for (let module of content.contentModules) {
            answers.push(module)
        }
    }

    for (let answer of answers) {
        const row = result.appendChild(document.createElement('tr'));
        switch (answer.moduleType) {
            case 'concept':
            case 'pattern':
            case 'hierarchy':
            case 'image':
            case 'video': {
                row.remove();
                break;
            } case 'exact-list':
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
                row.innerHTML = `<h3>${answer.moduleType === 'list' ? 'List' : (answer.moduleType === 'exact-list' ? 'Exact List' : 'Mind map')}</h3><b>${answer.content.statement}</b><p>${sentences.join('</p><p>')}</p>`;
                break;
            } case 'flow': {
                row.innerHTML = `<h3>Flow</h3><p>${answer.content.title}</p>`; // <p>${answer.content.orderedValues.join('<br>')}</p>`;
                const table = row.appendChild(document.createElement('table'));
                table.appendChild(document.createElement('tbody')).innerHTML = `<tr>${answer.content.orderedValues.join('</tr><tr>')}</tr>`;
                break;
            } case 'grid': {
                const grid = [];
                for (let i of answer.content.definitions) {
                    let sentence = [];
                    for (let word of i.word) {
                        if (typeof word === 'string') sentence.push(word);
                        else if (typeof word === 'object') sentence.push(word.caps);
                    }
                    grid.push(`<tr><td>${sentence.join('')}</td><td>${i.text}</td></tr>`);
                }
                row.innerHTML = `<h3>Grid</h3>`;
                const table = row.appendChild(document.createElement('table'));
                table.innerHTML = `${grid.join('')}`;
                break;
            } case 'image-description':
            case 'wordfill': {
                let sentence = [];
                for (let i of answer.content.words) {
                    if (typeof i === 'string') sentence.push(i);
                    else if (typeof i === 'object') sentence.push(`<u>${i.word.split('__')[1] || i.word}</u>`);
                }
                row.innerHTML = `<h3>${answer.moduleType === 'wordfill' ? 'Wordfill' : 'Image Description'}</h3><p>${sentence.join('')}</p>`;
                break;
            } case 'image-multi-choice': {
                const imageUrls = [];
                for (let i of answer.content.values) {
                    if (i.isCorrect) imageUrls.push(i.image);
                }
                const images = [];
                for (let i of imageUrls) {
                    images.push(`<img src="https://image-v2.cdn.app.senecalearning.com/${i.split('///')[1]}" alt="${i.split('/')[5]}">`);
                }
                row.innerHTML = `<h3>Image Multiple Choice</h3><p>${answer.content.title}</p><p>${images.join('')}</p>`;
                break;
            } case 'multiple-choice': {
                row.innerHTML = `<h3>Multiple Choice</h3><p>${answer.content.question}</p><p>${answer.content.correctAnswer}</p>`;
                break;
            } case 'multiSelect': {
                const correct = [];
                for (let i of answer.content.options) {
                    if (i.correct === true) correct.push(i.text);
                }
                row.innerHTML = `<h3>Multi Select</h3><p>${answer.content.question}</p><p>${correct.join('<br>')}</p>`
                break;
            } case 'toggles': {
                const toggles = [];
                for (let i of answer.content.toggles) {
                    toggles.push(i.correctToggle);
                }
                row.innerHTML = `<h3>Toggles</h3><p>${answer.content.statement}</p><p>${toggles.join('<br>')}</p>`
                break;
            } case 'worked-example': {
                const steps = [];
                for (let i of answer.content.steps) {
                    for (let j of i.equation) {
                        if (typeof j === 'object') steps.push(j.word);
                    }
                }
                row.innerHTML = `<h3>Worked Example</h3><p>${steps.join('<br>')}</p>`;
                break;
            } case 'wrong-word': {
                const sentence = [];
                for (let i of answer.content.sentence) {
                    if (typeof i === 'string') sentence.push(i);
                    else if (typeof i === 'object') sentence.push(`<u>${i.word}</u>`);
                }
                row.innerHTML = `<h3>Wrong Word</h3><p>${sentence.join('')}</p>`;
                break;
            } default: {
                row.innerHTML = `<h3>${answer.moduleType}</h3>`;
            }
        }
    }
});
