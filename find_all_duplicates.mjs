import fs from 'fs';

const POKEMON_PROPS = new Set(['num', 'name', 'types', 'gender', 'baseStats', 'abilities', 'heightm', 'weightkg', 'color', 'eggGroups', 'gen', 'evos', 'prevo', 'evoLevel', 'otherFormes', 'formeOrder', 'canGigantamax', 'baseSpecies', 'forme', 'requiredItem', 'changesFrom', 'genderRatio', 'evoType', 'evoCondition']);

function findDuplicates(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const keys = new Map();
    const duplicates = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let keyMatch = line.match(/^(\t|[ ]{1,})([a-z0-9]+): \{/);
        if (keyMatch) {
            let key = keyMatch[2];
            if (POKEMON_PROPS.has(key)) continue;

            if (keys.has(key)) {
                duplicates.push({key, line: i + 1, originalLine: keys.get(key)});
            } else {
                keys.set(key, i + 1);
            }
        }
    }
    return duplicates;
}

console.log('--- DUPLICATES ---');
[ './data/pokedex.ts', './data/mods/gen9ocb/pokedex.ts' ].forEach(path => {
    console.log(`\nFile: ${path}`);
    const dups = findDuplicates(path);
    dups.forEach(d => console.log(`${d.key}: ${d.line} (orig: ${d.originalLine})`));
});
