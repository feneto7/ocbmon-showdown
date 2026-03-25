import fs from 'fs';

const POKEMON_PROPS = new Set(['num', 'name', 'types', 'gender', 'baseStats', 'abilities', 'heightm', 'weightkg', 'color', 'eggGroups', 'gen', 'evos', 'prevo', 'evoLevel', 'otherFormes', 'formeOrder', 'canGigantamax', 'baseSpecies', 'forme', 'requiredItem', 'changesFrom', 'genderRatio', 'evoType', 'evoCondition']);

function findDuplicates(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const keys = new Map();
    const duplicates = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        // Match keys that are at exactly one level of indentation (one tab or some spaces)
        // and are not standard property names
        let keyMatch = line.match(/^(\t|[ ]{1,})([a-z0-9]+): \{/);
        if (keyMatch) {
            let key = keyMatch[2];
            if (POKEMON_PROPS.has(key)) continue;

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
