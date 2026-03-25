import fs from 'fs';

function findDuplicates(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const keys = new Map();
    const duplicates = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let keyMatch = line.match(/^[\t ]+([a-z0-9]+): \{/);
        if (keyMatch) {
            let key = keyMatch[1];
            if (keys.has(key)) {
                duplicates.push(`Duplicate key '${key}' at line ${i + 1} (already seen at line ${keys.get(key)})`);
            } else {
                keys.set(key, i + 1);
            }
        }
    }
    return duplicates;
}

console.log('--- Duplicates in data/pokedex.ts ---');
const dupsMain = findDuplicates('./data/pokedex.ts');
console.log(dupsMain.length ? dupsMain.join('\n') : 'No duplicates found.');

console.log('\n--- Duplicates in data/mods/gen9ocb/pokedex.ts ---');
const dupsMod = findDuplicates('./data/mods/gen9ocb/pokedex.ts');
console.log(dupsMod.length ? dupsMod.join('\n') : 'No duplicates found.');
