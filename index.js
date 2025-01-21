document.getElementById('button').addEventListener('click', async () => {
    const result = document.getElementById('result');
    const url = await browser.tabs.query({active: true, currentWindow: true}).then(tabs => tabs[0]?.url);
    if (url.split('app.senecalearning.com').length !== 2) result.textContent = 'Not in a Seneca lesson';
    const course = url.split('https://app.senecalearning.com/classroom/course/')[1].split('/section/')[0];
    const section = url.split('https://app.senecalearning.com/classroom/course/')[1].split('/section/')[1].split('/session')[0];
    let senecaUrl, seneca;

    await fetch('https://seneca.ellsies.tech/api/courses/' + course + '/signed-url?sectionId=' + section)
        .then(response => senecaUrl = response.json())
        .then(data => senecaUrl = data.url)
        .catch(error => result.textContent = 'Error getting signed url: ' + error.message);

    await fetch(senecaUrl)
        .then(response => response.json())
        .then(data => seneca = data)
        .catch(error => result.textContent = 'Error fetching data (seneca): ' + error.message);

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
                for (let i of answer.content.definitions) grid.push(`<tr><td>${i.word[0].caps}</td><td>${i.text}</td></tr>`);
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
            } case 'wordfill': case 'image-description': {
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
