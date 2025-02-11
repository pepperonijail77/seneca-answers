import { mkdir, copyFileSync , createWriteStream, readFileSync, writeFile, rm } from 'node:fs'
import archiver from 'archiver'
import ChromeExtension from 'crx'

const err = e => {
    if (e) throw e
};

mkdir('dist', {recursive: true}, err);

function firefox() {
    const output = createWriteStream('dist/seneca-answers.xpi')
    const archive = archiver('zip', {
        zlib: {level: 9}
    });

    output.on("close", () => {
        console.log("Built for Firefox.");
    });

    archive.on("warning", e => {
        if (e.code === "ENOENT") {
            console.warn(e)
        } else {
            throw e;
        }
    });
    archive.on("error", err);

    archive.pipe(output);

    archive.file('manifest.v2.json', {name: 'manifest.json'});
    archive.directory('icons/', 'icons');
    ['background.js', 'content.js', 'overlay.css'].forEach(file => {
        archive.file(file, {name: file});
    });

    archive.finalize();
}

async function chrome() {
    const crx = new ChromeExtension({
        codebase: 'dist/seneca-answers.crx',
        privateKey: readFileSync('key.pem', err),
    });

    mkdir('tmp', {recursive: true}, err);
    mkdir('tmp/icons', {recursive: true}, err);

    try {
        copyFileSync('manifest.v3.json', 'tmp/manifest.json');
        ['background.js', 'content.js', 'overlay.css', 'icons/icon-192.png'].forEach(file => {
            copyFileSync(file, 'tmp/' + file);
        });
    } catch (err) {
        rm('tmp', {recursive: true}, err);
        throw err;
    }

    await crx.load('tmp')
        .then(crx => crx.pack())
        .then(crxBuffer => writeFile('dist/seneca-answers.crx', crxBuffer, err))
        .catch(err);

    rm('tmp', {recursive: true}, err);

    console.log('Built for Chrome.');
}

const browser = process.argv[2];
if (browser === 'firefox') {
    firefox();
} else if (browser === 'chrome') {
    chrome();
} else if (browser === undefined) {
    firefox();
    chrome();
} else {
    console.error('Invalid browser');
    process.exit(1);
}