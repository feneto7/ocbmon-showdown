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
	// Match top-level keys in the Pokedex object
	let keyMatch = line.match(/^[\t ]+([a-zA-Z0-9]+): \{/);
	if (keyMatch) {
		currentKey = keyMatch[1];
	} else if (currentKey) {
		// Look for the 'name' property within that object
		let nameMatch = line.match(/^[\t ]+name: "([^"]+)"/);
		if (nameMatch) {
			let nameID = toID(nameMatch[1]);
			if (currentKey !== nameID) {
				mismatches.push(`[${i+1}] Key: ${currentKey}, Name: ${nameMatch[1]}, Expected: ${nameID}`);
			}
			currentKey = null; // Found name, reset for next key
		}
	}
}

console.log(`Found ${mismatches.length} mismatches.`);
for (const m of mismatches) {
    // Filter for ones with hyphens or other symbols that typically cause issues
    if (m.includes('-') || m.includes("'") || m.includes(' ')) {
        console.log(m);
    }
}
fs.writeFileSync('./mismatches_refined.txt', mismatches.join('\n'));
