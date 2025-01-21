const overlay = document.body.appendChild(document.createElement('div'));
overlay.id = 'overlay';
overlay.innerHTML = `
    <div id="overlay-content">
        <button id="button">Get Answers</button>
        <div>
            <table id="result">
            </table>
        </div>
    </div>
`;

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
        if (answer.moduleType === 'concept' || answer.moduleType === 'pattern' || answer.moduleType === 'hierarchy') continue;
        const row = result.appendChild(document.createElement('tr'));
        switch (answer.moduleType) {
            case 'grid': {
                let grid = [];
                for (let i of answer.content.definitions) {
                    let sentence = [];
                    for (let word of i.word) {
                        if (typeof word === 'string') sentence.push(word);
                        else if (typeof word === 'object') sentence.push(word.caps);
                    }
                    grid.push(`<tr><td>${sentence.join('')}</td><td>${i.text}</td></tr>`);
                };
                row.innerHTML = `<h3>Grid</h3>`;
                const table = row.appendChild(document.createElement('table'));
                table.innerHTML = `${grid.join('')}`;
                break;
            } case 'list': {
                let sentences = [];
                for (let i of answer.content.values) {
                    let sentence = [];
                    for (let j of i.value) {
                        if (typeof j === 'string') sentence.push(j);
                        else if (typeof j === 'object') sentence.push(`<u>${j.word}</u>`);
                    }
                    sentences.push(sentence.join(''));
                }
                row.innerHTML = `<h3>List</h3><b>${answer.content.statement}</b><p>${sentences.join('</p><p>')}</p>`;
                break;
            } case 'multiple-choice': {
                row.innerHTML = `<h3>Multiple Choice</h3><p>${answer.content.question}</p><p>${answer.content.correctAnswer}</p>`;
                break;
            } case 'toggles': {
                // ...
                break;
            } case 'wordfill':
            case 'image-description': {
                let sentence = [];
                for (let i of answer.content.words) {
                    if (typeof i === 'string') sentence.push(i);
                    else if (typeof i === 'object') sentence.push(`<u>${i.word.split('__')[1] || i.word}</u>`);
                }
                row.innerHTML = `<h3>${answer.moduleType === 'wordfill' ? 'Wordfill' : 'Image Description'}</h3><p>${sentence.join('')}</p>`;
                break;
            } case 'wrong-word': {
                let sentence = [];
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
