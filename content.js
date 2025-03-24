const brow = typeof browser === 'undefined' ? window.chrome : browser;
const overlay = document.body.appendChild(document.createElement('div'));
overlay.id = 'overlay';
overlay.innerHTML = `
    <div id="overlay-content">
        <button id="get-answers">Get answers</button>
        <button id="move">Move</button>
        <button id="close">X</button>
        <div>
            <table id="result">
            </table>
        </div>
    </div>
`;
const result = document.getElementById('result');

document.getElementById('close').addEventListener('click', () => {
    document.getElementById('overlay').hidden = true;
});

(function(elt, move) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
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
        console.log(pos1, pos2);
        elt.style.top = (elt.offsetTop - pos2) + "px";
        elt.style.right = (document.body.offsetWidth - elt.offsetWidth - elt.offsetLeft + pos1) + "px";
    }

    function closeDragElement() {
        move.style.cursor = 'grab';
        document.onmouseup = null;
        document.onmousemove = null;
    }
})(document.getElementById('overlay'), document.getElementById('move'));

document.getElementById('get-answers').addEventListener('click', async () => {
    result.innerHTML = 'Loading...';
    const url = document.location.href.split('/');

    const senecaUrl = await brow.runtime.sendMessage({type: 'signedUrl', course: url[5], section: url[7]}).then(r => {
        if (r.success) return r.data;
        else {
            result.textContent = 'Error getting signed url: ' + r.error;
            return 'failed';
        }
    }).catch(e => console.error(e));
    if (senecaUrl === 'failed' || senecaUrl === undefined) return;

    const seneca = await brow.runtime.sendMessage({type: 'seneca', url: senecaUrl}).then(r => {
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
            } case 'equation': {
                row.innerHTML = `<h3>Equation</h3><p>${answer.content.wordfillSentence}</p>`;
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
                row.innerHTML = `<h3>${answer.moduleType === 'list' ? 'List' : (answer.moduleType === 'exact-list' ? 'Exact List' : 'Mind map')}</h3><p><strong>${answer.content.statement}</strong></p><p>${sentences.join('<br><br>')}</p>`;
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
                        else if (typeof word === 'object') sentence.push(word.caps || word.word);
                    }
                    grid.push(`<tr><td>${sentence.join('')}</td><td>${i.text}</td></tr>`);
                }
                row.innerHTML = `<h3>Grid</h3>`;
                const table = row.appendChild(document.createElement('table'));
                table.innerHTML = `${grid.join('')}`;
                break;
            } case 'image-description':
            case 'wordfill': {
                const sentence = [];
                for (let word of answer.content.words) {
                    if (typeof word === 'string') sentence.push(word);
                    else if (typeof word === 'object') sentence.push(`<u>${word.word.split('__')[1] || word.word}</u>`);
                }
                row.innerHTML = `<h3>${answer.moduleType === 'wordfill' ? 'Wordfill' : 'Image Description'}</h3><p>${sentence.join('')}</p>`;
                break;
            } case 'image-label': {
                const labels = [];
                for (let label of answer.content.labels) {
                    if (label.word.isMixedDefinition) labels.push(label.word.processedWord[0].caps);
                    else labels.push(label.word.caps)
                }
                row.innerHTML = `<h3>Image Label</h3><p>${answer.content.title}</p><p>${labels.join('<br>')}</p>`;
                break;
            } case 'image-list': {
                const images = [];
                const values = [];
                for (let value of answer.content.values) {
                    images.push(`<img src="https://image-v2.cdn.app.senecalearning.com/${value.imgURL.split('///')[1]}" alt="${value.imgURL.split('/').at(-1)}">`);
                    values.push('');
                    for (let val of value.value) {
                        if (typeof val === 'string') values[values.length - 1] += val;
                        else if (typeof val === 'object') values[values.length - 1] += val.word;
                    }
                }
                row.innerHTML = `<h3>Image List</h3>`;
                const details = row.appendChild(document.createElement('details'));
                details.innerHTML = `<summary>${answer.content.statement || seneca.title}</summary>`
                for (let i = 0; i < images.length; i++) {
                    const span = details.appendChild(document.createElement('span'));
                    span.innerHTML= images[i] + values[i] + '<br><br>';
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
                    images.push(`<img src="https://image-v2.cdn.app.senecalearning.com/${url.split('///')[1]}" alt="${url.split('/').at(-1)}">`);
                }
                row.innerHTML = `<h3>Image Multiple Choice</h3><p>${answer.content.title}</p><p>${images.join('')}</p>`;
                break;
            } case 'multiple-choice': {
                row.innerHTML = `<h3>Multiple Choice</h3><p>${answer.content.question}</p><p>${answer.content.correctAnswer}</p>`;
                break;
            } case 'multiSelect': {
                const correct = [];
                for (let option of answer.content.options) {
                    if (option.correct === true) correct.push(option.text);
                }
                row.innerHTML = `<h3>Multi Select</h3><p>${answer.content.question}</p><p>${correct.join('<br>')}</p>`
                break;
            } case 'simple-calculation': {
                row.innerHTML = `<h3>Simple Calculation</h3><p>${answer.content.answersTemplate}</p>`
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
