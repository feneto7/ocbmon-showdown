"use strict";

const fs = require("fs");
const child_process = require("child_process");
const esbuild = require('esbuild');

const copyOverDataJSON = (file = 'data') => {
	const files = fs.readdirSync(file);
	for (const f of files) {
		if (fs.statSync(`${file}/${f}`).isDirectory()) {
			copyOverDataJSON(`${file}/${f}`);
		} else if (f.endsWith('.json')) {
			fs.copyFileSync(`${file}/${f}`, require('path').resolve('dist', `${file}/${f}`));
		}
	}
};

const shouldBeCompiled = file => {
	if (file.includes('node_modules/')) return false;
	if (file.endsWith('.tsx')) return true;
	if (file.endsWith('.ts')) return !(file.endsWith('.d.ts') || file.includes('global'));
	return false;
};

const findFilesForPath = path => {
	const out = [];
	try {
		const files = fs.readdirSync(path);
		for (const file of files) {
			const cur = `${path}/${file}`;
			// HACK: Logs and databases exclusions are a hack. Logs is too big to
			// traverse, databases adds/removes files which can lead to a filesystem
			// race between readdirSync and statSync. Please, at some point someone
			// fix this function to be more robust.
			if (cur.includes('node_modules') || cur.includes("/logs") || cur.includes("/databases") || 
			    cur.includes('.venv') || cur.includes('.git') || cur.includes('.DS_Store') ||
			    cur.includes('.pyc') || cur.includes('.pyo') || cur.includes('__pycache__')) continue;
			
			try {
				if (fs.statSync(cur).isDirectory()) {
					out.push(...findFilesForPath(cur));
				} else if (shouldBeCompiled(cur)) {
					out.push(cur);
				}
			} catch (err) {
				// Skip files that can't be accessed
				console.warn(`Skipping inaccessible file: ${cur}`);
				continue;
			}
		}
	} catch (err) {
		console.warn(`Cannot read directory: ${path}`);
	}
	return out;
};

exports.transpile = (decl) => {
	esbuild.buildSync({
		entryPoints: findFilesForPath('./'),
		outdir: './dist',
		outbase: '.',
		format: 'cjs',
		tsconfig: './tsconfig.json',
		sourcemap: true,
	});
	fs.copyFileSync('./config/config-example.js', './dist/config/config-example.js');
	copyOverDataJSON();

	// NOTE: replace is asynchronous - add additional replacements for the same path in one call instead of making multiple calls.
	if (decl) {
		exports.buildDecls();
	}
};

exports.buildDecls = () => {
	try {
		child_process.execSync(`node ./node_modules/typescript/bin/tsc -p sim`, {stdio: 'inherit'});
	} catch {}
};
