import {mkdir, copyFileSync, createWriteStream, readFileSync} from 'node:fs';
import archiver from 'archiver';

const err = e => {
	if (e) throw e;
};

mkdir('dist', {recursive: true}, err);

const files = ['background.js', 'content.js', 'overlay.css'];
let dev = false;

function build(target, dev, extension, manifest) {
	const version = JSON.parse(readFileSync(manifest)).version;
	return new Promise((resolve, reject) => {
		const output = createWriteStream(
			`dist/seneca-answers_${version}-${target}${dev ? '-dev' : ''}.${extension}`
		);
		const archive = archiver('zip', {zlib: {level: 9}});

		output.on('close', resolve);
		archive.on('warning', e => (e.code === 'ENOENT' ? console.warn(e) : reject(e)));
		archive.on('error', reject);
		archive.pipe(output);

		archive.file(manifest, {name: 'manifest.json'});
		archive.directory('src/icons/', 'icons');

		if (dev) {
			archive.directory('src/', false);
		} else {
			files.forEach(file => archive.file('src/' + file, {name: file}));
		}

		archive.finalize();
	});
}

const targets = {
	firefox: () =>
		build('firefox', dev, 'xpi', 'manifest.v2.json')
			.then(() => console.log('Built for Firefox.'))
			.catch(err),
	chrome: () =>
		build('chrome', dev, 'zip', 'manifest.v3.json')
			.then(() => console.log('Built for Chrome.'))
			.catch(err),
};

if (process.argv[3] === 'dev') dev = true;

const browser = process.argv[2];

if (browser === undefined) {
	Promise.all(Object.values(targets).map(fn => fn()));
} else if (targets[browser]) {
	targets[browser]();
} else {
	console.error('Invalid browser:', browser);
	process.exit(1);
}
