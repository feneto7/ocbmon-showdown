import fs from 'fs';

const filePath = './data/pokedex.ts';
const content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');

const toID = (text) => {
	if (text === undefined || text === null) return '';
	if (typeof text !== 'string') text = '' + text;
	return text.toLowerCase().replace(/[^a-z0-9]+/g, '');
};

let currentKey = null;
let mismatches = [];

for (let i = 0; i < lines.length; i++) {
	let line = lines[i];
	let keyMatch = line.match(/^[\t ]+([a-zA-Z0-9]+): \{/);
	if (keyMatch) {
		currentKey = keyMatch[1];
	} else if (currentKey) {
		let nameMatch = line.match(/^[\t ]+name: "([^"]+)"/);
		if (nameMatch) {
			let nameID = toID(nameMatch[1]);
			if (currentKey !== nameID) {
				mismatches.push(`[${i+1}] Key: ${currentKey}, Name: ${nameMatch[1]}, Expected: ${nameID}`);
			}
			currentKey = null;
		}
	}
}

console.log(`Found ${mismatches.length} mismatches.`);
for (const m of mismatches) {
    if (m.includes('Crawdauntless') || m.includes('-') || m.toLowerCase().includes('mimikyu') || m.toLowerCase().includes('heart')) {
        console.log(m);
    }
}
fs.writeFileSync('./mismatches.txt', mismatches.join('\n'));
