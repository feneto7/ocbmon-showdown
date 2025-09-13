/* eslint max-len: ["error", 240] */

import {Dex, toID} from '../../../sim/dex';
import {Species} from '../../../sim/dex-species';
import {PRNG, PRNGSeed} from '../../../sim/prng';

interface RandomBattleSetData {
	nicknames?: string[];
	sets?: {
		abilities?: string[],
		items?: string[],
		moves?: string[],
		lockedMoves?: string[],
		level?: number,
	}[];
}
export type RandomBattleSets = Record<string, RandomBattleSetData>;

export interface TeamData {
	typeCount: {[k: string]: number};
	typeComboCount: {[k: string]: number};
	baseFormes: {[k: string]: number};
	megaCount?: number;
	zCount?: number;
	has: {[k: string]: number};
	forceResult: boolean;
	weaknesses: {[k: string]: number};
	resistances: {[k: string]: number};
	weather?: string;
	eeveeLimCount?: number;
	gigantamax?: boolean;
}

export class RandomTeams {
	dex: ModdedDex;
	gen: number;
	readonly maxTeamSize: number;
	factoryTier: string;
	format: Format;
	prng: PRNG;
	noLead: string[] = [];

	constructor(format: Format | string, prng: PRNG | PRNGSeed | null) {
		format = Dex.formats.get(format);
		this.dex = Dex.forFormat(format);
		this.gen = this.dex.gen;
		const ruleTable = Dex.formats.getRuleTable(format);
		this.maxTeamSize = ruleTable.maxTeamSize;

		this.factoryTier = '';
		this.format = format;
		this.prng = prng && !Array.isArray(prng) ? prng : new PRNG(prng);
	}

	setSeed(prng?: PRNG | PRNGSeed) {
		this.prng = prng && !Array.isArray(prng) ? prng : new PRNG(prng);
	}

	getTeam(options?: PlayerOptions | null): PokemonSet[] {
		const generatorName = typeof this.format.team === 'string' && this.format.team.startsWith('random') ? this.format.team + 'Team' : '';
		// @ts-ignore
		return this[generatorName || 'randomTeam'](options);
	}

	randomChance(numerator: number, denominator: number) {
		return this.prng.randomChance(numerator, denominator);
	}

	sample<T>(items: readonly T[]): T {
		return this.prng.sample(items);
	}

	random(m?: number, n?: number) {
		return this.prng.next(m, n);
	}

	/**
	 * Remove an element from an unsorted array significantly faster
	 * than .splice
	 */
	fastPop<T>(list: T[], index: number) {
		// If an array doesn't need to be in order, replacing the
		// element at the given index with the removed element
		// is much, much faster than using list.splice(index, 1).
		const length = list.length;
		const element = list[index];
		list[index] = list[length - 1];
		list.pop();
		return element;
	}

	/**
	 * Remove a random element from an unsorted array and return it.
	 * Uses the battle's RNG if in a battle.
	 */
	sampleNoReplace<T>(list: T[]) {
		const length = list.length;
		const index = this.random(length);
		return this.fastPop(list, index);
	}

	queryMoves(moves: string[] | null, hasType: {[k: string]: boolean} = {}, hasAbility: {[k: string]: boolean} = {}, movePool: string[] = []) {
		// This is primarily a helper function for random setbuilder functions.
		const counter: {[k: string]: any} = {
			Physical: 0, Special: 0, Status: 0, damage: 0, recovery: 0, stab: 0, inaccurate: 0, priority: 0, recoil: 0, drain: 0, sound: 0,
			adaptability: 0, contrary: 0, ironfist: 0, serenegrace: 0, sheerforce: 0, skilllink: 0, strongjaw: 0, technician: 0,
			physicalsetup: 0, specialsetup: 0, mixedsetup: 0, speedsetup: 0, physicalpool: 0, specialpool: 0, hazards: 0,
			damagingMoves: [],
			damagingMoveIndex: {},
			setupType: '',
			Bug: 0, Dark: 0, Dragon: 0, Electric: 0, Fairy: 0, Fighting: 0, Fire: 0, Flying: 0, Ghost: 0, Grass: 0, Ground: 0,
			Ice: 0, Normal: 0, Poison: 0, Psychic: 0, Rock: 0, Steel: 0, Water: 0,
		};

		let typeDef: string;
		for (typeDef in this.dex.data.TypeChart) {
			counter[typeDef] = 0;
		}

		if (!moves || !moves.length) return counter;

		// Moves that restore HP:
		const RecoveryMove = [
			'healorder', 'milkdrink', 'moonlight', 'morningsun', 'recover', 'roost', 'shoreup', 'slackoff', 'softboiled', 'strengthsap', 'synthesis',
		];
		// Moves which drop stats:
		const ContraryMove = [
			'closecombat', 'leafstorm', 'overheat', 'superpower', 'vcreate',
		];
		// Moves that boost Attack:
		const PhysicalSetup = [
			'bellydrum', 'bulkup', 'coil', 'curse', 'dragondance', 'honeclaws', 'howl', 'poweruppunch', 'swordsdance',
		];
		// Moves which boost Special Attack:
		const SpecialSetup = [
			'calmmind', 'chargebeam', 'geomancy', 'nastyplot', 'quiverdance', 'tailglow',
		];
		// Moves which boost Attack AND Special Attack:
		const MixedSetup = [
			'clangoroussoul', 'growth', 'happyhour', 'holdhands', 'noretreat', 'shellsmash', 'workup',
		];
		// Moves which boost Speed:
		const SpeedSetup = [
			'agility', 'autotomize', 'flamecharge', 'rockpolish', 'shiftgear',
		];
		// Moves that shouldn't be the only STAB moves:
		const NoStab = [
			'accelerock', 'aquajet', 'bounce', 'breakingswipe', 'explosion', 'fakeout', 'firstimpression', 'flamecharge', 'flipturn',
			'iceshard', 'machpunch', 'pluck', 'pursuit', 'quickattack', 'selfdestruct', 'skydrop', 'suckerpunch', 'watershuriken',

			'clearsmog', 'eruption', 'icywind', 'incinerate', 'meteorbeam', 'snarl', 'vacuumwave', 'voltswitch', 'waterspout',
		];

		// Iterate through all moves we've chosen so far and keep track of what they do:
		for (const [k, moveId] of moves.entries()) {
			const move = this.dex.moves.get(moveId);
			const moveid = move.id;
			let movetype = move.type;
			if (['judgment', 'multiattack', 'revelationdance'].includes(moveid)) movetype = Object.keys(hasType)[0];
			if (move.damage || move.damageCallback) {
				// Moves that do a set amount of damage:
				counter['damage']++;
				counter.damagingMoves.push(move);
				counter.damagingMoveIndex[moveid] = k;
			} else {
				// Are Physical/Special/Status moves:
				counter[move.category]++;
			}
			// Moves that have a low base power:
			if (moveid === 'lowkick' || (move.basePower && move.basePower <= 60 && moveid !== 'rapidspin')) counter['technician']++;
			// Moves that hit up to 5 times:
			if (move.multihit && Array.isArray(move.multihit) && move.multihit[1] === 5) counter['skilllink']++;
			if (move.recoil || move.hasCrashDamage) counter['recoil']++;
			if (move.drain) counter['drain']++;
			// Moves which have a base power, but aren't super-weak like Rapid Spin:
			if (move.basePower > 30 || move.multihit || move.basePowerCallback || moveid === 'infestation' || moveid === 'naturepower') {
				counter[movetype]++;
				if (hasType[movetype]) {
					counter['adaptability']++;
					// STAB:
					// Certain moves aren't acceptable as a Pokemon's only STAB attack
					if (!NoStab.includes(moveid) && (moveid !== 'hiddenpower' || Object.keys(hasType).length === 1)) {
						counter['stab']++;
						// Ties between Physical and Special setup should broken in favor of STABs
						counter[move.category] += 0.1;
					}
				} else if (movetype === 'Normal' && (hasAbility['Aerilate'] || hasAbility['Galvanize'] || hasAbility['Pixilate'] || hasAbility['Refrigerate'])) {
					counter['stab']++;
				} else if (move.priority === 0 && (hasAbility['Libero'] || hasAbility['Protean']) && !NoStab.includes(moveid)) {
					counter['stab']++;
				} else if (movetype === 'Steel' && hasAbility['Steelworker']) {
					counter['stab']++;
				}
				if (move.flags['bite']) counter['strongjaw']++;
				if (move.flags['punch']) counter['ironfist']++;
				if (move.flags['sound']) counter['sound']++;
				counter.damagingMoves.push(move);
				counter.damagingMoveIndex[moveid] = k;
			}
			// Moves with secondary effects:
			if (move.secondary) {
				counter['sheerforce']++;
				if (move.secondary.chance && move.secondary.chance >= 20 && move.secondary.chance < 100) {
					counter['serenegrace']++;
				}
			}
			// Moves with low accuracy:
			if (move.accuracy && move.accuracy !== true && move.accuracy < 90) counter['inaccurate']++;
			// Moves with non-zero priority:
			if (move.category !== 'Status' && (move.priority !== 0 || (moveid === 'grassyglide' && hasAbility['Grassy Surge']))) {
				counter['priority']++;
			}

			// Moves that change stats:
			if (RecoveryMove.includes(moveid)) counter['recovery']++;
			if (ContraryMove.includes(moveid)) counter['contrary']++;
			if (PhysicalSetup.includes(moveid)) {
				counter['physicalsetup']++;
				counter.setupType = 'Physical';
			} else if (SpecialSetup.includes(moveid)) {
				counter['specialsetup']++;
				counter.setupType = 'Special';
			}
			if (MixedSetup.includes(moveid)) counter['mixedsetup']++;
			if (SpeedSetup.includes(moveid)) counter['speedsetup']++;
			if (['spikes', 'stealthrock', 'stickyweb', 'toxicspikes'].includes(moveid)) counter['hazards']++;
		}

		// Keep track of the available moves
		for (const moveid of movePool) {
			const move = this.dex.moves.get(moveid);
			if (move.damageCallback) continue;
			if (move.category === 'Physical') counter['physicalpool']++;
			if (move.category === 'Special') counter['specialpool']++;
		}

		// Choose a setup type:
		if (counter['mixedsetup']) {
			counter.setupType = 'Mixed';
		} else if (counter['physicalsetup'] && counter['specialsetup']) {
			const pool = {
				Physical: counter.Physical + counter['physicalpool'],
				Special: counter.Special + counter['specialpool'],
			};
			if (pool.Physical === pool.Special) {
				if (counter.Physical > counter.Special) counter.setupType = 'Physical';
				if (counter.Special > counter.Physical) counter.setupType = 'Special';
			} else {
				counter.setupType = pool.Physical > pool.Special ? 'Physical' : 'Special';
			}
		} else if (counter.setupType === 'Physical') {
			if ((counter.Physical < 2 && (!counter.stab || !counter['physicalpool'])) && (!moves.includes('rest') || !moves.includes('sleeptalk'))) {
				counter.setupType = '';
			}
		} else if (counter.setupType === 'Special') {
			if ((counter.Special < 2 && (!counter.stab || !counter['specialpool'])) && (!moves.includes('rest') || !moves.includes('sleeptalk')) && (!moves.includes('wish') || !moves.includes('protect'))) {
				counter.setupType = '';
			}
		}

		counter['Physical'] = Math.floor(counter['Physical']);
		counter['Special'] = Math.floor(counter['Special']);

		return counter;
	}

	randomSets: RandomBattleSets = require('./random-sets.json');

	randomSet(species: string | Species, teamDetails: RandomTeamsTypes.TeamDetails = {}, isLead = false, isDoubles = false, isCloveronly = false): RandomTeamsTypes.RandomSet {
		species = this.dex.species.get(species);
		let forme = species.name;
		let gmax = false;

		if (typeof species.battleOnly === 'string') {
			// Only change the forme. The species has custom moves, and may have different typing and requirements.
			forme = species.battleOnly;
		}
		if (species.cosmeticFormes) {
			forme = this.sample([species.name].concat(species.cosmeticFormes));
		}
		if (species.name.endsWith('-Gmax')) {
			forme = species.name.slice(0, -5);
			gmax = true;
		}

		let nickname: string | undefined = undefined;
		const cloverSetData = this.randomSets[species.id];
		if (cloverSetData && cloverSetData.nicknames) {
			nickname = this.sample(cloverSetData.nicknames);
		}

		const randomBattleSet = cloverSetData && cloverSetData.sets ?
			this.sample(cloverSetData.sets) :
			{};

		const singlesMoves = randomBattleSet.moves || species.randomBattleMoves;
		const randMoves = !isDoubles ? singlesMoves : (species.randomDoubleBattleMoves || singlesMoves);
		const lockedMoves = randomBattleSet.lockedMoves || [];
		const movePool = (randMoves || Object.keys(this.dex.data.Learnsets[species.id]!.learnset!)).slice();
		const lockedMovePool = lockedMoves.slice();
		const rejectedPool = [];
		const moves: string[] = [];
		let ability = '';
		let item = '';
		const evs = {
			hp: 85, atk: 85, def: 85, spa: 85, spd: 85, spe: 85,
		};
		const ivs = {
			hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31,
		};
		const hasType: {[k: string]: true} = {};
		hasType[species.types[0]] = true;
		if (species.types[1]) {
			hasType[species.types[1]] = true;
		}
		const hasAbility: {[k: string]: true} = {};
		hasAbility[species.abilities[0]] = true;
		if (species.abilities[1]) {
			hasAbility[species.abilities[1]] = true;
		}
		if (species.abilities['H']) {
			hasAbility[species.abilities['H']] = true;
		}

		let hasMove: {[k: string]: boolean} = {};
		let counter;

		do {
			// Keep track of all moves we have:
			hasMove = {};
			for (const moveid of moves) {
				hasMove[moveid] = true;
			}

			// Choose next 4 moves from learnset/viable moves and add them to moves list:
			const pool = movePool.length ? movePool : rejectedPool;
			while (moves.length < 4 && pool.length) {
				const moveid = this.sampleNoReplace(pool);
				hasMove[moveid] = true;
				moves.push(moveid);
			}

			counter = this.queryMoves(moves, hasType, hasAbility, movePool);

			// Iterate through the moves again, this time to cull them:
			for (const [k, moveId] of moves.entries()) {
				const move = this.dex.moves.get(moveId);
				const moveid = move.id;
				let rejected = false;
				let isSetup = false;

				switch (moveid) {
				// Not very useful without their supporting moves
				case 'acrobatics': case 'junglehealing':
					if (!counter.setupType && !isDoubles) rejected = true;
					break;
				case 'destinybond': case 'healbell':
					if (movePool.includes('protect') || movePool.includes('wish')) rejected = true;
					break;
				case 'dualwingbeat': case 'fly': case 'storedpower':
					if (!hasType[move.type] && !counter.setupType && !!counter.Status) rejected = true;
					break;
				case 'fireblast':
					if (hasAbility['Serene Grace'] && (!hasMove['trick'] || counter.Status > 1)) rejected = true;
					break;
				case 'firepunch':
					if (movePool.includes('bellydrum') || hasMove['earthquake'] && movePool.includes('substitute')) rejected = true;
					break;
				case 'flamecharge': case 'sacredsword':
					if (counter.damagingMoves.length < 3 && !counter.setupType) rejected = true;
					if (!hasType['Grass'] && movePool.includes('swordsdance')) rejected = true;
					break;
				case 'futuresight':
					if (!counter.Status || !hasMove['teleport']) rejected = true;
					break;
				case 'hypervoice':
					if (hasType['Electric'] && movePool.includes('thunderbolt')) rejected = true;
					break;
				case 'payback': case 'psychocut':
					if (!counter.Status || hasMove['rest'] && hasMove['sleeptalk']) rejected = true;
					break;
				case 'rest':
					if (movePool.includes('sleeptalk')) rejected = true;
					if (!hasMove['sleeptalk'] && (movePool.includes('bulkup') || movePool.includes('calmmind') || movePool.includes('coil') || movePool.includes('curse'))) rejected = true;
					break;
				case 'sleeptalk':
					if (!hasMove['rest']) rejected = true;
					if (movePool.length > 1 && !hasAbility['Contrary']) {
						const rest = movePool.indexOf('rest');
						if (rest >= 0) this.fastPop(movePool, rest);
					}
					break;
				case 'switcheroo': case 'trick':
					if (counter.Physical + counter.Special < 3 || hasMove['futuresight'] || hasMove['rapidspin']) rejected = true;
					break;
				case 'trickroom':
					if (counter.damagingMoves.length < 2 || movePool.includes('nastyplot') || isLead || teamDetails.stickyWeb) rejected = true;
					break;
				case 'zenheadbutt':
					if (movePool.includes('boltstrike')) rejected = true;
					break;

				// Set up once and only if we have the moves for it
				case 'bellydrum': case 'bulkup': case 'coil': case 'curse': case 'dragondance': case 'honeclaws': case 'swordsdance':
					if (counter.setupType !== 'Physical') rejected = true;
					if (counter.Physical + counter['physicalpool'] < 2 && (!hasMove['rest'] || !hasMove['sleeptalk'])) rejected = true;
					if (moveid === 'swordsdance' && hasMove['dragondance']) rejected = true;
					isSetup = true;
					break;
				case 'calmmind': case 'nastyplot':
					if (counter.setupType !== 'Special') rejected = true;
					if (counter.Special + counter['specialpool'] < 2 && (!hasMove['rest'] || !hasMove['sleeptalk']) && (!hasMove['wish'] || !hasMove['protect'])) rejected = true;
					if (hasMove['healpulse'] || moveid === 'calmmind' && hasMove['trickroom']) rejected = true;
					isSetup = true;
					break;
				case 'quiverdance':
					isSetup = true;
					break;
				case 'clangoroussoul': case 'shellsmash': case 'workup':
					if (counter.setupType !== 'Mixed') rejected = true;
					if (counter.damagingMoves.length + counter['physicalpool'] + counter['specialpool'] < 2) rejected = true;
					isSetup = true;
					break;
				case 'agility': case 'autotomize': case 'rockpolish': case 'shiftgear':
					if (counter.damagingMoves.length < 2 || hasMove['rest']) rejected = true;
					if (movePool.includes('calmmind') || movePool.includes('nastyplot')) rejected = true;
					if (!counter.setupType) isSetup = true;
					break;

				// Bad after setup
				case 'counter': case 'reversal':
					if (counter.setupType) rejected = true;
					break;
				case 'firstimpression': case 'glare': case 'icywind': case 'tailwind': case 'waterspout':
					if ((counter.setupType && !isDoubles) || !!counter['speedsetup'] || hasMove['rest']) rejected = true;
					break;
				case 'bulletpunch': case 'rockblast':
					if (!!counter['speedsetup'] || counter.damagingMoves.length < 2) rejected = true;
					break;
				case 'closecombat': case 'flashcannon': case 'pollenpuff':
					if ((hasMove['substitute'] && !hasType['Fighting']) || hasMove['toxic'] && movePool.includes('substitute')) rejected = true;
					if (moveid === 'closecombat' && (hasMove['highjumpkick'] || movePool.includes('highjumpkick')) && !counter.setupType) rejected = true;
					break;
				case 'defog':
					if (counter.setupType || hasMove['healbell'] || hasMove['toxicspikes'] || teamDetails.defog) rejected = true;
					break;
				case 'fakeout':
					if (counter.setupType || hasMove['protect'] || hasMove['rapidspin'] || hasMove['substitute'] || hasMove['uturn']) rejected = true;
					break;
				case 'healingwish': case 'memento':
					if (counter.setupType || !!counter['recovery'] || hasMove['substitute'] || hasMove['uturn']) rejected = true;
					break;
				case 'highjumpkick': case 'machpunch':
					if (hasMove['curse']) rejected = true;
					break;
				case 'leechseed': case 'teleport':
					if (counter.setupType || !!counter['speedsetup']) rejected = true;
					break;
				case 'partingshot':
					if (!!counter['speedsetup'] || hasMove['bulkup'] || hasMove['uturn']) rejected = true;
					break;
				case 'protect':
					if ((counter.setupType && !hasMove['wish'] && !isDoubles) || hasMove['rest'] && hasMove['sleeptalk']) rejected = true;
					if (counter.Status < 2 && !hasAbility['Hunger Switch'] && !hasAbility['Speed Boost'] && !isDoubles) rejected = true;
					if (movePool.includes('leechseed') || movePool.includes('toxic') && !hasMove['wish']) rejected = true;
					if (isDoubles && (movePool.includes('fakeout') || movePool.includes('shellsmash') || movePool.includes('spore') || hasMove['tailwind'] || hasMove['waterspout'])) rejected = true;
					break;
				case 'rapidspin':
					if (hasMove['curse'] || hasMove['nastyplot'] || hasMove['shellsmash'] || teamDetails.rapidSpin) rejected = true;
					if (counter.setupType && counter['Fighting'] >= 2) rejected = true;
					break;
				case 'shadowsneak':
					if (hasMove['substitute'] || hasMove['trickroom']) rejected = true;
					if (hasMove['dualwingbeat'] || hasMove['toxic'] || hasMove['rest'] && hasMove['sleeptalk']) rejected = true;
					break;
				case 'spikes':
					if (counter.setupType || teamDetails.spikes && teamDetails.spikes > 1) rejected = true;
					break;
				case 'stealthrock':
					if (counter.setupType || !!counter['speedsetup'] || hasMove['rest'] || hasMove['substitute'] || hasMove['trickroom'] || teamDetails.stealthRock) rejected = true;
					break;
				case 'stickyweb':
					if (counter.setupType === 'Special' || teamDetails.stickyWeb) rejected = true;
					break;
				case 'taunt':
					if (hasMove['nastyplot'] || hasMove['swordsdance']) rejected = true;
					break;
				case 'thunderwave': case 'voltswitch':
					if (counter.setupType || !!counter['speedsetup'] || hasMove['raindance']) rejected = true;
					if (isDoubles && (hasMove['electroweb'] || hasMove['nuzzle'])) rejected = true;
					break;
				case 'toxic':
					if (counter.setupType || hasMove['sludgewave'] || hasMove['thunderwave'] || hasMove['willowisp']) rejected = true;
					break;
				case 'toxicspikes':
					if (counter.setupType || teamDetails.toxicSpikes) rejected = true;
					break;
				case 'uturn':
					if (!!counter['speedsetup'] || (counter.setupType && (!hasType['Bug'] || !counter.recovery))) rejected = true;
					if (isDoubles && hasMove['leechlife']) rejected = true;
					break;

				// Ineffective having both
				// Attacks:
				case 'explosion':
					if (!!counter['recovery'] || hasMove['painsplit'] || hasMove['wish']) rejected = true;
					if (!!counter['speedsetup'] || hasMove['curse'] || hasMove['drainpunch'] || hasMove['rockblast']) rejected = true;
					break;
				case 'facade':
					if (!!counter['recovery'] || movePool.includes('doubleedge')) rejected = true;
					break;
				case 'quickattack':
					if (!!counter['speedsetup'] || hasType['Rock'] && !!counter.Status) rejected = true;
					if (counter.Physical > 3 && movePool.includes('uturn')) rejected = true;
					break;
				case 'blazekick':
					if (counter.Special >= 1) rejected = true;
					break;
				case 'firefang': case 'flamethrower':
					if (hasMove['heatwave'] || hasMove['overheat'] || hasMove['fireblast'] && counter.setupType !== 'Physical') rejected = true;
					break;
				case 'overheat':
					if (hasMove['flareblitz'] || isDoubles && hasMove['calmmind']) rejected = true;
					break;
				case 'aquajet': case 'psychicfangs':
					if (hasMove['rapidspin'] || hasMove['taunt']) rejected = true;
					break;
				case 'aquatail': case 'flipturn': case 'retaliate':
					if (hasMove['aquajet'] || !!counter.Status) rejected = true;
					break;
				case 'hydropump':
					if (hasMove['scald'] && ((counter.Special < 4 && !hasMove['uturn']) || (species.types.length > 1 && counter.stab < 3))) rejected = true;
					break;
				case 'scald':
					if (hasMove['waterpulse']) rejected = true;
					break;
				case 'thunderbolt':
					if (hasMove['powerwhip']) rejected = true;
					break;
				case 'gigadrain':
					if (hasMove['uturn'] || hasType['Poison'] && !counter['Poison']) rejected = true;
					break;
				case 'leafblade':
					if ((hasMove['leafstorm'] || movePool.includes('leafstorm')) && counter.setupType !== 'Physical') rejected = true;
					break;
				case 'leafstorm':
					if (hasMove['gigadrain'] && !!counter.Status) rejected = true;
					if (isDoubles && hasMove['energyball']) rejected = true;
					break;
				case 'powerwhip':
					if (hasMove['leechlife'] || !hasType['Grass'] && counter.Physical > 3 && movePool.includes('uturn')) rejected = true;
					break;
				case 'woodhammer':
					if (hasMove['hornleech'] && counter.Physical < 4) rejected = true;
					break;
				case 'freezedry':
					if ((hasMove['blizzard'] && counter.setupType) || hasMove['icebeam'] && counter.Special < 4) rejected = true;
					if (movePool.includes('bodyslam') || movePool.includes('thunderwave') && hasType['Electric']) rejected = true;
					break;
				case 'bodypress':
					if (hasMove['mirrorcoat'] || hasMove['whirlwind']) rejected = true;
					if (hasMove['shellsmash'] || hasMove['earthquake'] && movePool.includes('shellsmash')) rejected = true;
					break;
				case 'circlethrow':
					if (hasMove['stormthrow'] && !hasMove['rest']) rejected = true;
					break;
				case 'drainpunch':
					if (hasMove['closecombat'] || !hasType['Fighting'] && movePool.includes('swordsdance')) rejected = true;
					break;
				case 'dynamicpunch': case 'thunderouskick':
					if (hasMove['closecombat'] || hasMove['facade']) rejected = true;
					break;
				case 'focusblast':
					if (movePool.includes('shellsmash') || hasMove['rest'] && hasMove['sleeptalk']) rejected = true;
					break;
				case 'hammerarm':
					if (hasMove['fakeout']) rejected = true;
					break;
				case 'seismictoss':
					if (hasMove['protect'] && hasType['Water']) rejected = true;
					break;
				case 'stormthrow':
					if (hasMove['rest'] && hasMove['sleeptalk']) rejected = true;
					break;
				case 'superpower':
					if (hasMove['hydropump'] || counter.Physical >= 4 && movePool.includes('uturn')) rejected = true;
					if (hasMove['substitute'] && !hasAbility['Contrary']) rejected = true;
					if (hasAbility['Contrary']) isSetup = true;
					break;
				case 'poisonjab':
					if (!hasType['Poison'] && counter.Status >= 2) rejected = true;
					break;
				case 'earthquake':
					if (hasMove['bonemerang'] || hasMove['substitute'] && movePool.includes('toxic')) rejected = true;
					if (movePool.includes('bodypress') && movePool.includes('shellsmash')) rejected = true;
					if (isDoubles && (hasMove['earthpower'] || hasMove['highhorsepower'])) rejected = true;
					break;
				case 'scorchingsands':
					if (hasMove['earthpower'] || hasMove['toxic'] && movePool.includes('earthpower')) rejected = true;
					if (hasMove['willowisp']) rejected = true;
					break;
				case 'airslash':
					if ((hasMove['hurricane'] && !counter.setupType) || hasMove['rest'] && hasMove['sleeptalk']) rejected = true;
					if (movePool.includes('flamethrower') || hasAbility['Simple'] && !!counter['recovery']) rejected = true;
					break;
				case 'bravebird':
					if (hasMove['dragondance']) rejected = true;
					break;
				case 'hurricane':
					if (hasAbility['Tinted Lens'] && counter.setupType && !isDoubles) rejected = true;
					break;
				case 'photongeyser':
					if (hasMove['morningsun']) rejected = true;
					break;
				case 'psychic':
					if (hasMove['psyshock'] && (counter.setupType || isDoubles)) rejected = true;
					break;
				case 'psyshock':
					if ((hasMove['psychic'] || hasAbility['Pixilate']) && counter.Special < 4 && !counter.setupType) rejected = true;
					if (hasAbility['Multiscale'] && !counter.setupType) rejected = true;
					if (isDoubles && hasMove['psychic']) rejected = true;
					break;
				case 'bugbuzz':
					if (hasMove['uturn'] && !counter.setupType) rejected = true;
					break;
				case 'leechlife':
					if (isDoubles && hasMove['lunge']) rejected = true;
					if (movePool.includes('firstimpression') || movePool.includes('spikes')) rejected = true;
					break;
				case 'stoneedge':
					if (hasMove['rockblast'] || hasMove['rockslide'] || !!counter.Status && movePool.includes('rockslide')) rejected = true;
					if (hasAbility['Guts'] && (!hasMove['dynamicpunch'] || hasMove['spikes'])) rejected = true;
					break;
				case 'poltergeist':
					if (hasMove['knockoff']) rejected = true;
					break;
				case 'shadowball':
					if (hasAbility['Pixilate'] && (counter.setupType || counter.Status > 1)) rejected = true;
					if (isDoubles && hasMove ['phantomforce']) rejected = true;
					break;
				case 'shadowclaw':
					if (hasType['Steel'] && hasMove['shadowsneak'] && counter.Physical < 4) rejected = true;
					break;
				case 'dragonpulse': case 'spacialrend':
					if (hasMove['dracometeor'] && counter.Special < 4) rejected = true;
					break;
				case 'darkpulse':
					if ((hasMove['foulplay'] || hasMove['knockoff'] || hasMove['suckerpunch'] || hasMove['defog']) && counter.setupType !== 'Special') rejected = true;
					break;
				case 'knockoff':
					if (hasMove['darkestlariat']) rejected = true;
					break;
				case 'suckerpunch':
					if (counter.damagingMoves.length < 2 || counter['Dark'] > 1 && !hasType['Dark']) rejected = true;
					if (hasMove['rest']) rejected = true;
					break;
				case 'meteormash':
					if (movePool.includes('extremespeed')) rejected = true;
					break;
				case 'dazzlinggleam':
					if (hasMove['fleurcannon'] || hasMove['moonblast'] || hasMove['petaldance']) rejected = true;
					break;

				// Status:
				case 'bodyslam': case 'clearsmog':
					if (hasMove['sludgebomb'] || hasMove['toxic'] && !hasType['Normal']) rejected = true;
					if (hasMove['trick'] || movePool.includes('recover')) rejected = true;
					break;
				case 'haze':
					if ((hasMove['stealthrock'] || movePool.includes('stealthrock')) && !teamDetails.stealthRock) rejected = true;
					break;
				case 'hypnosis':
					if (hasMove['voltswitch']) rejected = true;
					break;
				case 'willowisp': case 'yawn':
					if (hasMove['thunderwave'] || hasMove['toxic']) rejected = true;
					break;
				case 'painsplit': case 'recover': case 'synthesis':
					if (hasMove['rest'] || hasMove['wish']) rejected = true;
					if (moveid === 'synthesis' && hasMove['gigadrain']) rejected = true;
					break;
				case 'roost':
					if (hasMove['throatchop'] || hasMove['stoneedge'] && !hasType['Rock']) rejected = true;
					break;
				case 'reflect': case 'lightscreen':
					if (teamDetails.screens) rejected = true;
					break;
				case 'substitute':
					if (hasMove['facade'] || hasMove['rest'] || hasMove['uturn']) rejected = true;
					if (movePool.includes('bulkup') || movePool.includes('painsplit') || movePool.includes('roost') || movePool.includes('calmmind') && !counter['recovery']) rejected = true;
					if (isDoubles && movePool.includes('powerwhip')) rejected = true;
					break;
				case 'helpinghand':
					if (hasMove['acupressure']) rejected = true;
					break;
				case 'wideguard':
					if (hasMove['protect']) rejected = true;
					break;
				}

				// This move doesn't satisfy our setup requirements:
				if (((move.category === 'Physical' && counter.setupType === 'Special') || (move.category === 'Special' && counter.setupType === 'Physical')) && moveid !== 'photongeyser') {
					// Reject STABs last in case the setup type changes later on
					const stabs: number = counter[species.types[0]] + (counter[species.types[1]] || 0);
					if (!hasType[move.type] || stabs > 1 || counter[move.category] < 2) rejected = true;
				}

				// Pokemon should have moves that benefit their types, stats, or ability
				if (!rejected && !move.damage && !isSetup && !move.weather && !move.stallingMove &&
					(isDoubles || (!['facade', 'lightscreen', 'reflect', 'sleeptalk', 'spore', 'substitute', 'switcheroo', 'toxic', 'whirlpool'].includes(moveid) && (move.category !== 'Status' || !move.flags.heal))) &&
					(!counter.setupType || counter.setupType === 'Mixed' || (move.category !== counter.setupType && move.category !== 'Status') || (counter[counter.setupType] + counter.Status > 3 && !counter.hazards)) &&
				(
					(!counter.stab && counter['physicalpool'] + counter['specialpool'] > 0) ||
					(hasType['Bug'] && movePool.includes('megahorn')) ||
					(hasType['Dark'] && (!counter['Dark'] || (hasMove['suckerpunch'] && (movePool.includes('knockoff') || movePool.includes('wickedblow'))))) ||
					(hasType['Dragon'] && !counter['Dragon'] && !hasMove['dragonascent'] && !hasMove['substitute'] && !(hasMove['rest'] && hasMove['sleeptalk'])) ||
					(hasType['Electric'] && (!counter['Electric'] || movePool.includes('thunder'))) ||
					(hasType['Fairy'] && !counter['Fairy'] && (movePool.includes('dazzlinggleam') || movePool.includes('fleurcannon') || movePool.includes('moonblast') || movePool.includes('playrough'))) ||
					(hasType['Fighting'] && (!counter['Fighting'] || !counter.stab)) ||
					(hasType['Fire'] && (!counter['Fire'] || movePool.includes('flareblitz')) && !hasMove['bellydrum']) ||
					((hasType['Flying'] || hasMove['swordsdance']) && !counter['Flying'] && (movePool.includes('airslash') || movePool.includes('bravebird') || movePool.includes('dualwingbeat') || movePool.includes('oblivionwing'))) ||
					(hasType['Ghost'] && (!counter['Ghost'] || movePool.includes('poltergeist') || movePool.includes('spectralthief')) && !counter['Dark']) ||
					(hasType['Grass'] && !counter['Grass'] && (species.baseStats.atk >= 100 || movePool.includes('leafstorm'))) ||
					(hasType['Ground'] && !counter['Ground']) ||
					(hasType['Ice'] && (!counter['Ice'] || movePool.includes('iciclecrash') || (hasAbility['Snow Warning'] && movePool.includes('blizzard')))) ||
					((hasType['Normal'] && hasAbility['Guts'] && movePool.includes('facade')) || (hasAbility['Pixilate'] && !counter['Normal'])) ||
					(hasType['Poison'] && !counter['Poison'] && (hasType['Ground'] || hasType['Psychic'] || counter.setupType || movePool.includes('gunkshot'))) ||
					(hasType['Psychic'] && !counter['Psychic'] && !hasType['Ghost'] && !hasType['Steel'] && (hasAbility['Psychic Surge'] || counter.setupType || movePool.includes('psychicfangs'))) ||
					(hasType['Rock'] && !counter['Rock'] && species.baseStats.atk >= 80) ||
					((hasType['Steel'] || hasAbility['Steelworker']) && (!counter['Steel'] || (hasMove['bulletpunch'] && counter.stab < 2)) && species.baseStats.atk >= 95) ||
					(hasType['Water'] && ((!counter['Water'] && !hasMove['hypervoice']) || movePool.includes('hypervoice'))) ||
					((hasAbility['Moody'] || hasMove['wish']) && movePool.includes('protect')) ||
					(((hasMove['lightscreen'] && movePool.includes('reflect')) || (hasMove['reflect'] && movePool.includes('lightscreen'))) && !teamDetails.screens) ||
					((movePool.includes('morningsun') || movePool.includes('recover') || movePool.includes('roost') || movePool.includes('slackoff') || movePool.includes('softboiled')) &&
						!!counter.Status && !counter.setupType && !hasMove['healingwish'] && !hasMove['switcheroo'] && !hasMove['trick'] && !hasMove['trickroom'] && !isDoubles) ||
					(movePool.includes('milkdrink') || movePool.includes('quiverdance') || movePool.includes('stickyweb') && !counter.setupType && !teamDetails.stickyWeb) ||
					(isLead && movePool.includes('stealthrock') && !!counter.Status && !counter.setupType && !counter['speedsetup'] && !hasMove['substitute']) ||
					(isDoubles && species.baseStats.def >= 140 && movePool.includes('bodypress'))
				)) {
					// Reject Status, non-STAB, or low basepower moves
					if (move.category === 'Status' || !hasType[move.type] || move.basePower && move.basePower < 50 && !move.multihit && !hasAbility['Technician']) {
						rejected = true;
					}
				}

				// Sleep Talk shouldn't be selected without Rest
				if (moveid === 'rest' && rejected) {
					const sleeptalk = movePool.indexOf('sleeptalk');
					if (sleeptalk >= 0) {
						if (movePool.length < 2) {
							rejected = false;
						} else {
							this.fastPop(movePool, sleeptalk);
						}
					}
				}

				// Remove rejected moves from the move list
				if (rejected && movePool.length) {
					if (move.category !== 'Status' && !move.damage) rejectedPool.push(moves[k]);
					moves.splice(k, 1);
					break;
				}
				if (rejected && rejectedPool.length) {
					moves.splice(k, 1);
					break;
				}
			}
		} while (moves.length < 4 && (movePool.length || rejectedPool.length));

		let lockedMovesSelected = 0;
		while (lockedMovePool.length && lockedMovesSelected < 4) {
			if (moves.length < 4) {
				moves.push(this.sampleNoReplace(lockedMovePool));
			} else {
				const lockedMove = this.sampleNoReplace(lockedMovePool);
				moves[lockedMovesSelected] = lockedMove;
				lockedMovesSelected++;
			}
		}

		counter = this.queryMoves(moves, hasType, hasAbility, movePool);

		if (randomBattleSet.abilities && randomBattleSet.abilities.length > 0) {
			ability = this.sample(randomBattleSet.abilities);
		} else {
			const abilities: string[] = Object.values(species.abilities);
			abilities.sort((a, b) => this.dex.abilities.get(b).rating - this.dex.abilities.get(a).rating);
			let ability0 = this.dex.abilities.get(abilities[0]);
			let ability1 = this.dex.abilities.get(abilities[1]);
			let ability2 = this.dex.abilities.get(abilities[2]);
			if (abilities[1]) {
				if (abilities[2] && ability1.rating <= ability2.rating && this.randomChance(1, 2)) {
					[ability1, ability2] = [ability2, ability1];
				}
				if (ability0.rating <= ability1.rating && this.randomChance(1, 2)) {
					[ability0, ability1] = [ability1, ability0];
				} else if (ability0.rating - 0.6 <= ability1.rating && this.randomChance(2, 3)) {
					[ability0, ability1] = [ability1, ability0];
				}
				ability = ability0.name;

				let rejectAbility: boolean;
				do {
					rejectAbility = false;
					if (['Cloud Nine', 'Flare Boost', 'Hydration', 'Ice Body', 'Innards Out', 'Insomnia', 'Misty Surge', 'Quick Feet', 'Rain Dish', 'Snow Cloak', 'Steadfast', 'Steam Engine', 'Weak Armor'].includes(ability)) {
						rejectAbility = true;
					} else if (['Adaptability', 'Contrary', 'Serene Grace', 'Skill Link', 'Strong Jaw'].includes(ability)) {
						rejectAbility = !counter[toID(ability)];
					} else if (ability === 'Analytic') {
						rejectAbility = (hasMove['rapidspin'] || species.nfe || isDoubles);
					} else if (ability === 'Blaze') {
						rejectAbility = (isDoubles && hasAbility['Solar Power']);
					} else if (ability === 'Bulletproof' || ability === 'Overcoat') {
						rejectAbility = (counter.setupType && hasAbility['Soundproof']);
					} else if (ability === 'Chlorophyll') {
						rejectAbility = (species.baseStats.spe > 100 || !counter['Fire'] && !hasMove['sunnyday'] && !teamDetails['sun']);
					} else if (ability === 'Competitive') {
						rejectAbility = (counter['Special'] < 2 || hasMove['rest'] && hasMove['sleeptalk']);
					} else if (ability === 'Compound Eyes' || ability === 'No Guard') {
						rejectAbility = !counter['inaccurate'];
					} else if (ability === 'Cursed Body') {
						rejectAbility = hasAbility['Infiltrator'];
					} else if (ability === 'Defiant') {
						rejectAbility = !counter['Physical'];
					} else if (ability === 'Download') {
						rejectAbility = counter.damagingMoves.length < 3;
					} else if (ability === 'Early Bird') {
						rejectAbility = (hasType['Grass'] && isDoubles);
					} else if (ability === 'Flash Fire') {
						rejectAbility = (this.dex.getEffectiveness('Fire', species) < -1 || hasAbility['Drought']);
					} else if (ability === 'Gluttony') {
						rejectAbility = !hasMove['bellydrum'];
					} else if (ability === 'Guts') {
						rejectAbility = (!hasMove['facade'] && !hasMove['sleeptalk'] && !species.nfe);
					} else if (ability === 'Harvest') {
						rejectAbility = (hasAbility['Frisk'] && !isDoubles);
					} else if (ability === 'Hustle' || ability === 'Inner Focus') {
						rejectAbility = (counter.Physical < 2 || hasAbility['Iron Fist']);
					} else if (ability === 'Infiltrator') {
						rejectAbility = ((hasMove['rest'] && hasMove['sleeptalk']) || isDoubles && hasAbility['Clear Body']);
					} else if (ability === 'Intimidate') {
						rejectAbility = (hasMove['bodyslam'] || hasMove['bounce'] || hasMove['tripleaxel']);
					} else if (ability === 'Iron Fist') {
						rejectAbility = (counter['ironfist'] < 2 || hasMove['dynamicpunch']);
					} else if (ability === 'Justified') {
						rejectAbility = (isDoubles && hasAbility['Inner Focus']);
					} else if (ability === 'Lightning Rod') {
						rejectAbility = (species.types.includes('Ground') || counter.setupType === 'Physical');
					} else if (ability === 'Limber') {
						rejectAbility = species.types.includes('Electric');
					} else if (ability === 'Liquid Voice') {
						rejectAbility = !hasMove['hypervoice'];
					} else if (ability === 'Magic Guard') {
						rejectAbility = (hasAbility['Tinted Lens'] && !counter.Status && !isDoubles);
					} else if (ability === 'Mold Breaker') {
						rejectAbility = (hasAbility['Adaptability'] || hasAbility['Scrappy'] || (hasAbility['Sheer Force'] && !!counter['sheerforce']) || hasAbility['Unburden'] && counter.setupType);
					} else if (ability === 'Moxie') {
						rejectAbility = (counter.Physical < 2 || hasMove['stealthrock']);
					} else if (ability === 'Neutralizing Gas') {
						rejectAbility = !hasMove['toxicspikes'];
					} else if (ability === 'Overgrow') {
						rejectAbility = !counter['Grass'];
					} else if (ability === 'Own Tempo') {
						rejectAbility = !hasMove['petaldance'];
					} else if (ability === 'Power Construct') {
						rejectAbility = (species.forme === '10%' && !isDoubles);
					} else if (ability === 'Prankster') {
						rejectAbility = !counter['Status'];
					} else if (ability === 'Pressure') {
						rejectAbility = (counter.setupType || counter.Status < 2 || isDoubles);
					} else if (ability === 'Refrigerate') {
						rejectAbility = !counter['Normal'];
					} else if (ability === 'Regenerator') {
						rejectAbility = hasAbility['Magic Guard'];
					} else if (ability === 'Reckless' || ability === 'Rock Head') {
						rejectAbility = !counter['recoil'];
					} else if (ability === 'Sand Force' || ability === 'Sand Veil') {
						rejectAbility = !teamDetails['sand'];
					} else if (ability === 'Sand Rush') {
						rejectAbility = (!teamDetails['sand'] && (!counter.setupType || !counter['Rock'] || hasMove['rapidspin']));
					} else if (ability === 'Sap Sipper') {
						rejectAbility = hasMove['roost'];
					} else if (ability === 'Scrappy') {
						rejectAbility = (hasMove['earthquake'] && hasMove['milkdrink']);
					} else if (ability === 'Screen Cleaner') {
						rejectAbility = !!teamDetails['screens'];
					} else if (ability === 'Shadow Tag') {
						rejectAbility = (species.name === 'Gothitelle' && !isDoubles);
					} else if (ability === 'Shed Skin') {
						rejectAbility = hasMove['dragondance'];
					} else if (ability === 'Sheer Force') {
						rejectAbility = (!counter['sheerforce'] || hasAbility['Guts']);
					} else if (ability === 'Slush Rush') {
						rejectAbility = (!teamDetails['hail'] && !hasAbility['Swift Swim']);
					} else if (ability === 'Sniper') {
						rejectAbility = (counter['Water'] > 1 && !hasMove['focusenergy']);
					} else if (ability === 'Steely Spirit') {
						rejectAbility = (hasMove['fakeout'] && !isDoubles);
					} else if (ability === 'Sturdy') {
						rejectAbility = (hasMove['bulkup'] || !!counter['recoil'] || hasAbility['Solid Rock']);
					} else if (ability === 'Swarm') {
						rejectAbility = (!counter['Bug'] || !!counter['recovery']);
					} else if (ability === 'Sweet Veil') {
						rejectAbility = hasType['Grass'];
					} else if (ability === 'Swift Swim') {
						rejectAbility = (!hasMove['raindance'] && (hasAbility['Intimidate'] || (hasAbility['Lightning Rod'] && !counter.setupType) || hasAbility['Rock Head'] || hasAbility['Slush Rush'] || hasAbility['Water Absorb']));
					} else if (ability === 'Synchronize') {
						rejectAbility = counter.Status < 3;
					} else if (ability === 'Technician') {
						rejectAbility = (!counter['technician'] || hasMove['tailslap'] || hasAbility['Punk Rock'] || movePool.includes('snarl'));
					} else if (ability === 'Tinted Lens') {
						rejectAbility = (hasMove['defog'] || hasMove['hurricane'] || counter.Status > 2 && !counter.setupType);
					} else if (ability === 'Torrent') {
						rejectAbility = (hasMove['focusenergy'] || hasMove['hypervoice']);
					} else if (ability === 'Tough Claws') {
						rejectAbility = (hasType['Steel'] && !hasMove['fakeout']);
					} else if (ability === 'Unaware') {
						rejectAbility = (counter.setupType || hasMove['stealthrock']);
					} else if (ability === 'Unburden') {
						rejectAbility = (hasAbility['Prankster'] || !counter.setupType && !isDoubles);
					} else if (ability === 'Volt Absorb') {
						rejectAbility = (this.dex.getEffectiveness('Electric', species) < -1);
					} else if (ability === 'Water Absorb') {
						rejectAbility = (hasMove['raindance'] || hasAbility['Drizzle'] || hasAbility['Strong Jaw'] || hasAbility['Unaware'] || hasAbility['Volt Absorb']);
					}

					if (rejectAbility) {
						if (ability === ability0.name && ability1.rating >= 1) {
							ability = ability1.name;
						} else if (ability === ability1.name && abilities[2] && ability2.rating >= 1) {
							ability = ability2.name;
						} else {
							// Default to the highest rated ability if all are rejected
							ability = abilities[0];
							rejectAbility = false;
						}
					}
				} while (rejectAbility);

				if (species.name === 'Azumarill' && !isDoubles) {
					ability = 'Sap Sipper';
				} else if (forme === 'Copperajah' && gmax) {
					ability = 'Heavy Metal';
				} else if (hasAbility['Guts'] && (hasMove['facade'] || (hasMove['rest'] && hasMove['sleeptalk']))) {
					ability = 'Guts';
				} else if (hasAbility['Moxie'] && (counter.Physical > 3 || hasMove['bounce']) && !isDoubles) {
					ability = 'Moxie';
				} else if (isDoubles) {
					if (hasAbility['Competitive'] && ability !== 'Shadow Tag' && ability !== 'Strong Jaw') ability = 'Competitive';
					if (hasAbility['Curious Medicine'] && this.randomChance(1, 2)) ability = 'Curious Medicine';
					if (hasAbility['Friend Guard']) ability = 'Friend Guard';
					if (hasAbility['Gluttony'] && hasMove['recycle']) ability = 'Gluttony';
					if (hasAbility['Guts']) ability = 'Guts';
					if (hasAbility['Harvest']) ability = 'Harvest';
					if (hasAbility['Healer'] && hasAbility['Natural Cure']) ability = 'Healer';
					if (hasAbility['Intimidate']) ability = 'Intimidate';
					if (hasAbility['Klutz'] && ability === 'Limber') ability = 'Klutz';
					if (hasAbility['Magic Guard'] && ability !== 'Friend Guard' && ability !== 'Unaware') ability = 'Magic Guard';
					if (hasAbility['Ripen']) ability = 'Ripen';
					if (hasAbility['Stalwart']) ability = 'Stalwart';
					if (hasAbility['Storm Drain']) ability = 'Storm Drain';
					if (hasAbility['Telepathy'] && (ability === 'Pressure' || hasAbility['Analytic'])) ability = 'Telepathy';
				}
			} else {
				ability = ability0.name;
			}
		}

		if (randomBattleSet.items && randomBattleSet.items.length > 0) {
			item = this.sample(randomBattleSet.items);
		} else {
			item = !isDoubles ? 'Leftovers' : 'Sitrus Berry';
			if (species.requiredItems) {
				item = this.sample(species.requiredItems);

			// First, the extra high-priority items
			} else if (['Corsola', 'Garchomp', 'Tangrowth'].includes(species.name) && !!counter.Status && !counter.setupType && !isDoubles) {
				item = 'Rocky Helmet';
			} else if (species.name === 'Eternatus' && counter.Status < 2) {
				item = 'Metronome';
			} else if (species.name === 'Froslass' && !isDoubles) {
				item = 'Wide Lens';
			} else if (species.name === 'Latios' && counter.Special === 2 && !isDoubles) {
				item = 'Soul Dew';
			} else if (species.name === 'Lopunny') {
				item = isDoubles ? 'Iron Ball' : 'Toxic Orb';
			} else if (species.baseSpecies === 'Marowak') {
				item = 'Thick Club';
			} else if (species.baseSpecies === 'Pikachu' || species.baseSpecies === 'Pikotton') {
				item = 'Light Ball';
			} else if (species.baseSpecies === 'Masdawg' || species.baseSpecies === 'Pasdawg') {
				item = 'Thicc Bone';
			} else if (species.baseSpecies === 'Urswine') {
				item = 'Bacon Strip';
			} else if (species.baseSpecies === 'Pretzely') {
				item = 'Suede Shoes';
			} else if (species.baseSpecies === 'Caroline') {
				item = 'Bible';
			} else if (species.baseSpecies === 'Flameboyan') {
				item = 'Big Faggot';
			} else if (species.baseSpecies === 'Walruskie') {
				item = 'Manifesto';
			} else if (species.name === 'Regieleki' && !isDoubles) {
				item = 'Normal Gem';
			} else if (species.name === 'Shedinja') {
				item = (!teamDetails.defog && !teamDetails.rapidSpin && !isDoubles) ? 'Heavy-Duty Boots' : 'Focus Sash';
			} else if (species.name === 'Shuckle' && hasMove['stickyweb']) {
				item = 'Mental Herb';
			} else if (species.name === 'Unfezant' || hasMove['focusenergy']) {
				item = 'Scope Lens';
			} else if (species.name === 'Wobbuffet' || ['Cheek Pouch', 'Harvest', 'Ripen'].includes(ability)) {
				item = 'Sitrus Berry';
			} else if (ability === 'Gluttony') {
				item = this.sample(['Aguav', 'Figy', 'Iapapa', 'Mago', 'Wiki']) + ' Berry';
			} else if (ability === 'Gorilla Tactics' || ability === 'Imposter' || (ability === 'Magnet Pull' && hasMove['bodypress'] && !isDoubles)) {
				item = 'Choice Scarf';
			} else if (hasMove['trick'] || hasMove['switcheroo'] && !isDoubles) {
				if (species.baseStats.spe >= 60 && species.baseStats.spe <= 108 && !counter['priority'] && ability !== 'Triage') {
					item = 'Choice Scarf';
				} else {
					item = (counter.Physical > counter.Special) ? 'Choice Band' : 'Choice Specs';
				}
			} else if (species.evos.length && !hasMove['uturn']) {
				item = 'Eviolite';
			} else if (hasMove['bellydrum']) {
				item = (!!counter['priority'] || !hasMove['substitute']) ? 'Sitrus Berry' : 'Salac Berry';
			} else if (hasMove['geomancy'] || hasMove['meteorbeam']) {
				item = 'Power Herb';
			} else if (hasMove['shellsmash']) {
				item = (ability === 'Sturdy' && !isLead && !isDoubles) ? 'Heavy-Duty Boots' : 'White Herb';
			} else if (ability === 'Guts' && (counter.Physical > 2 || isDoubles)) {
				item = hasType['Fire'] ? 'Toxic Orb' : 'Flame Orb';
			} else if (ability === 'Magic Guard' && counter.damagingMoves.length > 1) {
				item = hasMove['counter'] ? 'Focus Sash' : 'Life Orb';
			} else if (ability === 'Sheer Force' && !!counter['sheerforce']) {
				item = 'Life Orb';
			} else if (ability === 'Unburden') {
				item = (hasMove['closecombat'] || hasMove['curse']) ? 'White Herb' : 'Sitrus Berry';
			} else if (hasMove['acrobatics']) {
				item = (ability === 'Grassy Surge') ? 'Grassy Seed' : '';
			} else if (hasMove['auroraveil'] || hasMove['lightscreen'] && hasMove['reflect']) {
				item = 'Light Clay';
			} else if (hasMove['rest'] && !hasMove['sleeptalk'] && ability !== 'Shed Skin') {
				item = 'Chesto Berry';
			} else if (hasMove['hypnosis'] && ability === 'Beast Boost') {
				item = 'Blunder Policy';
			} else if (this.dex.getEffectiveness('Rock', species) >= 2 && !isDoubles) {
				item = 'Heavy-Duty Boots';

			// Doubles
			} else if (isDoubles && (hasMove['dragonenergy'] || hasMove['eruption'] || hasMove['waterspout']) && counter.damagingMoves.length >= 4) {
				item = 'Choice Scarf';
			} else if (isDoubles && hasMove['blizzard'] && ability !== 'Snow Warning' && !teamDetails['hail']) {
				item = 'Blunder Policy';
			} else if (isDoubles && this.dex.getEffectiveness('Rock', species) >= 2 && !hasType['Flying']) {
				item = 'Heavy-Duty Boots';
			} else if (isDoubles && counter.Physical >= 4 && (hasType['Dragon'] || hasType['Fighting'] || hasType['Rock'] || hasMove['flipturn'] || hasMove['uturn']) &&
				!hasMove['fakeout'] && !hasMove['feint'] && !hasMove['rapidspin'] && !hasMove['suckerpunch']
			) {
				item = (!counter['priority'] && !hasAbility['Speed Boost'] && !hasMove['aerialace'] && species.baseStats.spe >= 60 && species.baseStats.spe <= 100 && this.randomChance(1, 2)) ? 'Choice Scarf' : 'Choice Band';
			} else if (isDoubles && ((counter.Special >= 4 && (hasType['Dragon'] || hasType ['Fighting'] || hasType['Rock'] || hasMove['voltswitch'])) || (counter.Special >= 3 &&
				(hasMove['flipturn'] || hasMove['uturn'])) && !hasMove['acidspray'] && !hasMove['electroweb'])
			) {
				item = (species.baseStats.spe >= 60 && species.baseStats.spe <= 100 && this.randomChance(1, 2)) ? 'Choice Scarf' : 'Choice Specs';
			} else if (isDoubles && counter.damagingMoves.length >= 4 && species.baseStats.hp + species.baseStats.def + species.baseStats.spd >= 280) {
				item = 'Assault Vest';
			} else if (isDoubles && counter.damagingMoves.length >= 3 && species.baseStats.spe >= 60 && ability !== 'Multiscale' && ability !== 'Sturdy' && !hasMove['acidspray'] && !hasMove['clearsmog'] && !hasMove['electroweb'] &&
				!hasMove['fakeout'] && !hasMove['feint'] && !hasMove['icywind'] && !hasMove['incinerate'] && !hasMove['naturesmadness'] && !hasMove['rapidspin'] && !hasMove['snarl'] && !hasMove['uturn']
			) {
				item = (ability === 'Defeatist' || species.baseStats.hp + species.baseStats.def + species.baseStats.spd >= 275) ? 'Sitrus Berry' : 'Life Orb';

			// Medium priority
			} else if (counter.Physical >= 4 && ability !== 'Serene Grace' && !hasMove['fakeout'] && !hasMove['flamecharge'] && !hasMove['rapidspin'] && (!hasMove['tailslap'] || hasMove['uturn']) && !isDoubles) {
				const scarfReqs = (
					(species.baseStats.atk >= 100 || ability === 'Huge Power') && species.baseStats.spe >= 60 && species.baseStats.spe <= 108 &&
					ability !== 'Speed Boost' && !counter['priority'] && !hasMove['aerialace'] && !hasMove['bounce'] && !hasMove['dualwingbeat']
				);
				item = (scarfReqs && this.randomChance(2, 3)) ? 'Choice Scarf' : 'Choice Band';
			} else if (counter.Physical >= 3 && (hasMove['copycat'] || hasMove['memento'] || hasMove['partingshot']) && !hasMove['rapidspin'] && !isDoubles) {
				item = 'Choice Band';
			} else if ((counter.Special >= 4 || (counter.Special >= 3 && (hasMove['flipturn'] || hasMove['partingshot'] || hasMove['uturn']))) && !isDoubles) {
				const scarfReqs = species.baseStats.spa >= 100 && species.baseStats.spe >= 60 && species.baseStats.spe <= 108 && ability !== 'Tinted Lens' && !counter.Physical;
				item = (scarfReqs && this.randomChance(2, 3)) ? 'Choice Scarf' : 'Choice Specs';
			} else if (((counter.Physical >= 3 && hasMove['defog']) || (counter.Special >= 3 && hasMove['healingwish'])) && !counter['priority'] && !hasMove['uturn'] && !isDoubles) {
				item = 'Choice Scarf';
			} else if (hasMove['raindance'] || hasMove['sunnyday'] || (ability === 'Speed Boost' && !counter['hazards']) || ability === 'Stance Change' && counter.damagingMoves.length >= 3) {
				item = 'Life Orb';
			} else if (this.dex.getEffectiveness('Rock', species) >= 1 && (['Defeatist', 'Emergency Exit', 'Multiscale'].includes(ability) || hasMove['courtchange'] || hasMove['defog'] || hasMove['rapidspin']) && !isDoubles) {
				item = 'Heavy-Duty Boots';
			} else if (species.name === 'Necrozma-Dusk-Mane' || (this.dex.getEffectiveness('Ground', species) < 2 && !!counter['speedsetup'] &&
				counter.damagingMoves.length >= 3 && species.baseStats.hp + species.baseStats.def + species.baseStats.spd >= 300)
			) {
				item = 'Weakness Policy';
			} else if (counter.damagingMoves.length >= 4 && species.baseStats.hp + species.baseStats.def + species.baseStats.spd >= 235) {
				item = 'Assault Vest';
			} else if ((hasMove['clearsmog'] || hasMove['curse'] || hasMove['haze'] || hasMove['healbell'] || hasMove['protect'] || hasMove['sleeptalk'] || hasMove['strangesteam']) && (ability === 'Moody' || !isDoubles)) {
				item = 'Leftovers';

			// Better than Leftovers
			} else if (isLead && !['Disguise', 'Sturdy'].includes(ability) &&
			!hasMove['substitute'] && !counter['recoil'] && !counter['recovery'] && species.baseStats.hp + species.baseStats.def + species.baseStats.spd < 255 && !isDoubles) {
				item = 'Focus Sash';
			} else if (ability === 'Water Bubble' && !isDoubles) {
				item = 'Mystic Water';
			} else if (hasMove['clangoroussoul'] || hasMove['boomburst'] && !!counter['speedsetup']) {
				item = 'Throat Spray';
			} else if (((this.dex.getEffectiveness('Rock', species) >= 1 && (!teamDetails.defog || ability === 'Intimidate' || hasMove['uturn'] || hasMove['voltswitch'])) ||
				(hasMove['rapidspin'] && (ability === 'Regenerator' || !!counter['recovery']))) && !isDoubles
			) {
				item = 'Heavy-Duty Boots';
			} else if (this.dex.getEffectiveness('Ground', species) >= 2 && !hasType['Poison'] && ability !== 'Levitate' && !hasAbility['Iron Barbs'] && !isDoubles) {
				item = 'Air Balloon';
			} else if (counter.damagingMoves.length >= 3 && !counter['damage'] && ability !== 'Sturdy' && !hasMove['foulplay'] && !hasMove['rapidspin'] && !hasMove['substitute'] && !hasMove['uturn'] && !isDoubles &&
				(!!counter['speedsetup'] || hasMove['trickroom'] || !!counter['drain'] || hasMove['psystrike'] || (species.baseStats.spe > 40 && species.baseStats.hp + species.baseStats.def + species.baseStats.spd < 275))
			) {
				item = 'Life Orb';
			} else if (counter.damagingMoves.length >= 4 && !counter['Dragon'] && !counter['Normal'] && !isDoubles) {
				item = 'Expert Belt';
			} else if ((hasMove['dragondance'] || hasMove['swordsdance']) && !isDoubles &&
				(hasMove['outrage'] || !hasType['Bug'] && !hasType['Fire'] && !hasType['Ground'] && !hasType['Normal'] && !hasType['Poison'] && !['Pastel Veil', 'Storm Drain'].includes(ability))
			) {
				item = 'Lum Berry';
			}

			// For Trick / Switcheroo
			if (item === 'Leftovers' && hasType['Poison']) {
				item = 'Black Sludge';
			}
		}

		const fochunItems = [
			"????????",
			"Master Ball",
			"Ultra Ball",
			"Great Ball",
			"Poké Ball",
			"Safari Ball",
			"Net Ball",
			"Dive Ball",
			"Nest Ball",
			"Repeat Ball",
			"Timer Ball",
			"Luxury Ball",
			"Premier Ball",
			"Potion",
			"Antidote",
			"Burn Heal",
			"Ice Heal",
			"Awakening",
			"Paralyz Heal",
			"Full Restore",
			"Max Potion",
			"Hyper Potion",
			"Super Potion",
			"Full Heal",
			"Revive",
			"Max Revive",
			"Fresh Water",
			"Soda Pop",
			"Lemonade",
			"Moomoo Milk",
			"Energypowder",
			"Energy Root",
			"Heal Powder",
			"Revival Herb",
			"Ether",
			"Max Ether",
			"Elixir",
			"Max Elixir",
			"Lava Cookie",
			"Blue Flute",
			"Yellow Flute",
			"Red Flute",
			"Black Flute",
			"White Flute",
			"Berry Juice",
			"Sacred Ash",
			"Shoal Salt",
			"Shoal Shell",
			"Red Shard",
			"Blue Shard",
			"Yellow Shard",
			"Green Shard",
			"Quick Ball",
			"Dusk Ball",
			"Heal Ball",
			"Junk Ball",
			"Masta Ball",
			"Monster Ball",
			"Fast Ball",
			"Barbed Ball",
			"Rasta Ball",
			"B-Ball",
			"Rude Ball",
			"HP Up",
			"Protein",
			"Iron",
			"Carbos",
			"Calcium",
			"Rare Candy",
			"PP Up",
			"Zinc",
			"PP Max",
			"Magnet Ball",
			"Guard Spec.",
			"Dire Hit",
			"X Attack",
			"X Defend",
			"X Speed",
			"X Accuracy",
			"X Special",
			"Poké Doll",
			"Dream Ball",
			"Cellar Key",
			"Super Repel",
			"Max Repel",
			"Escape Rope",
			"Repel",
			"DDT Spray",
			"Rare Bone",
			"Grip Claw",
			"Destiny Knot",
			"Bottlecap",
			"Golden Cap",
			"Sun Stone",
			"Moon Stone",
			"Fire Stone",
			"Thunderstone",
			"Water Stone",
			"Leaf Stone",
			"Far Doll",
			"Tor Doll",
			"Metal Coat",
			"Up-Grade",
			"Tinymushroom",
			"Big Mushroom",
			"Binding Band",
			"Pearl",
			"Big Pearl",
			"Stardust",
			"Star Piece",
			"Nugget",
			"Heart Scale",
			"Gold Clover",
			"Clover Leaf",
			"Odd Dildo",
			"Pirate's Jug",
			"Porn Drive",
			"House Key",
			"Cursed Coin",
			"Custap Berry",
			"Lab Key",
			"Orange Mail",
			"Harbor Mail",
			"Glitter Mail",
			"Mech Mail",
			"Wood Mail",
			"Wave Mail",
			"Bead Mail",
			"Shadow Mail",
			"Tropic Mail",
			"Dream Mail",
			"Fab Mail",
			"Retro Mail",
			"Cheri Berry",
			"Chesto Berry",
			"Pecha Berry",
			"Rawst Berry",
			"Aspear Berry",
			"Leppa Berry",
			"Oran Berry",
			"Persim Berry",
			"Lum Berry",
			"Sitrus Berry",
			"Figy Berry",
			"Wiki Berry",
			"Mago Berry",
			"Aguav Berry",
			"Iapapa Berry",
			"Occa Berry",
			"Passho Berry",
			"Nanab Berry",
			"Rindo Berry",
			"Wacan Berry",
			"Pomeg Berry",
			"Kelpsy Berry",
			"Qualot Berry",
			"Hondew Berry",
			"Grepa Berry",
			"Tamato Berry",
			"Yache Berry",
			"Chople Berry",
			"Kebia Berry",
			"Nomel Berry",
			"Shuca Berry",
			"Coba Berry",
			"Watmel Berry",
			"Payapa Berry",
			"Tanga Berry",
			"Liechi Berry",
			"Ganlon Berry",
			"Salac Berry",
			"Petaya Berry",
			"Apicot Berry",
			"Lansat Berry",
			"Starf Berry",
			"Enigma Berry",
			"Charti Berry",
			"Kasib Berry",
			"Haban Berry",
			"Brightpowder",
			"White Herb",
			"Macho Brace",
			"Dream Pill",
			"Quick Claw",
			"Soothe Bell",
			"Mental Herb",
			"Choice Band",
			"King's Rock",
			"Silverpowder",
			"Amulet Coin",
			"Cleanse Tag",
			"Power Herb",
			"Big Faggot",
			"Bacon Strip",
			"Smoke Ball",
			"Everstone",
			"Focus Band",
			"Lucky Egg",
			"Scope Lens",
			"Iron Ball",
			"Leftovers",
			"Lagging Tail",
			"Light Ball",
			"Soft Sand",
			"Hard Stone",
			"Miracle Seed",
			"Black Glasses",
			"Black Belt",
			"Magnet",
			"Mystic Water",
			"Sharp Beak",
			"Poison Barb",
			"Never-Melt Ice",
			"Spell Tag",
			"Twisted Spoon",
			"Charcoal",
			"Dragon Fang",
			"Silk Scarf",
			"Shed Shell",
			"Shell Bell",
			"Sea Incense",
			"Lax Incense",
			"Air Balloon",
			"Metal Powder",
			"Thicc Bone",
			"Bible",
			"Choice Specs",
			"Choice Scarf",
			"Life Orb",
			"Rocky Helmet",
			"Black Sludge",
			"Assault Vest",
			"Eviolite",
			"Colbur Berry",
			"Babiri Berry",
			"Chilan Berry",
			"Roseli Berry",
			"Expert Belt",
			"Flame Orb",
			"Toxic Orb",
			"Wide Lens",
			"Light Clay",
			"Razor Claw",
			"Suede Shoes",
			"Safety Goggles",
			"Ability Pill",
			"Focus Sash",
			"Heat Rock",
			"Damp Rock",
			"Taco",
			"Weed",
			"Zoom Lens",
			"Cute Bow",
			"Katana",
			"Smooth Rock",
			"Icy Rock",
			"Terrain Extender",
			"Weakness Policy",
			"Sticky Barb",
			"Eject Button",
			"Coin Case",
			"Itemfinder",
			"Old Rod",
			"Good Rod",
			"Super Rod",
			"Ruse Ticket",
			"Normal Gem",
			"Walkman",
			"Fighting Gem",
			"Flying Gem",
			"Poison Gem",
			"Ground Gem",
			"Rock Gem",
			"Bug Gem",
			"Ghost Gem",
			"Steel Gem",
			"Fire Gem",
			"Burn Drive",
			"Chill Drive",
			"Douse Drive",
			"Shock Drive",
			"Room Key",
			"Water Gem",
			"Grass Gem",
			"Electric Gem",
			"Psychic Gem",
			"Fang Fossil",
			"Conch Fossil",
			"Ice Gem",
			"TM01",
			"TM02",
			"TM03",
			"TM04",
			"TM05",
			"TM06",
			"TM07",
			"TM08",
			"TM09",
			"TM10",
			"TM11",
			"TM12",
			"TM13",
			"TM14",
			"TM15",
			"TM16",
			"TM17",
			"TM18",
			"TM19",
			"TM20",
			"TM21",
			"TM22",
			"TM23",
			"TM24",
			"TM25",
			"TM26",
			"TM27",
			"TM28",
			"TM29",
			"TM30",
			"TM31",
			"TM32",
			"TM33",
			"TM34",
			"TM35",
			"TM36",
			"TM37",
			"TM38",
			"TM39",
			"TM40",
			"TM41",
			"TM42",
			"TM43",
			"TM44",
			"TM45",
			"TM46",
			"TM47",
			"TM48",
			"TM49",
			"TM50",
			"HM01",
			"HM02",
			"HM03",
			"HM04",
			"HM05",
			"HM06",
			"HM07",
			"HM08",
			"Old Key",
			"Rusty Key",
			"Large Parcel",
			"Poop Flute",
			"Cage Key",
			"Axe",
			"Ban Hammer",
			"Raptor Claw",
			"Card Key",
			"Lift Key",
			"Tooth Fossil",
			"Horn Fossil",
			"Skelecharm",
			"Bicycle",
			"Town Map",
			"VS Seeker",
			"Fame Checker",
			"TM Case",
			"Berry Pouch",
			"Dragon Gem",
			"Battle Pass",
			"Ebin Pass",
			"Manifesto",
			"Dark Gem",
			"Fairy Gem",
			"Powder Jar",
			"Big Root",
			"Jar of Pee",
		].map(toID);

		if (isCloveronly && !fochunItems.includes(toID(item))) {
			item = 'Leftovers';
		}

		const singlesLevel = randomBattleSet.level || species.randomBattleLevel;
		let level: number = (!isDoubles ? singlesLevel : species.randomDoubleBattleLevel) || 80;

		// Weaken mons with strong abilities
		if (['shadowtag', 'arenatrap', 'moody', 'wonderguard'].includes(toID(ability))) {
			level -= 8;
		}

		// Prepare optimal HP
		const srWeakness = (ability === 'Magic Guard' || item === 'Heavy-Duty Boots' ? 0 : this.dex.getEffectiveness('Rock', species));
		while (evs.hp > 1) {
			const hp = Math.floor(Math.floor(2 * species.baseStats.hp + ivs.hp + Math.floor(evs.hp / 4) + 100) * level / 100 + 10);
			if (hasMove['substitute'] && (item === 'Sitrus Berry' || ability === 'Power Construct' || (hasMove['bellydrum'] && item === 'Salac Berry'))) {
				// Two Substitutes should activate Sitrus Berry
				if (hp % 4 === 0) break;
			} else if (hasMove['bellydrum'] && (item === 'Sitrus Berry' || ability === 'Gluttony')) {
				// Belly Drum should activate Sitrus Berry
				if (hp % 2 === 0) break;
			} else if (hasMove['substitute'] && hasMove['reversal']) {
				// Reversal users should be able to use four Substitutes
				if (hp % 4 > 0) break;
			} else {
				// Maximize number of Stealth Rock switch-ins
				if (srWeakness <= 0 || hp % (4 / srWeakness) > 0) break;
			}
			evs.hp -= 4;
		}

		if (hasMove['shellsidearm'] && item === 'Choice Specs') evs.atk -= 4;

		// Minimize confusion damage
		if (!counter['Physical'] && !hasMove['transform'] && (!hasMove['shellsidearm'] || !counter.Status)) {
			evs.atk = 0;
			ivs.atk = 0;
		}

		if (hasMove['gyroball'] || hasMove['trickroom']) {
			evs.spe = 0;
			ivs.spe = 0;
		}

		return {
			name: nickname || species.baseSpecies,
			species: forme,
			gender: species.gender,
			moves: moves,
			ability: ability,
			evs: evs,
			ivs: ivs,
			item: item,
			level: level,
			shiny: this.randomChance(1, 1024),
			gigantamax: gmax,
		};
	}

	getFestivePokemonPool(pokemon: RandomTeamsTypes.RandomSet[] = []) {
		const exclude = pokemon.map(p => toID(p.species));
		const pokemonPool = [];
		for (const id in this.dex.data.FormatsData) {
			const species = this.dex.species.get(id);
			if (species.gen > this.gen || exclude.includes(species.id)) continue;
			if (!species.types.includes('Fairy') && !species.types.includes('Grass') && !species.types.includes('Ice') && !species.types.includes('Normal')) continue;
			if (species.num <= 69000 || species.num > 69386) continue;
			pokemonPool.push(id);
		}
		return pokemonPool;
	}

	randomFestiveTeam() {
		const seed = this.prng.seed;
		const pokemon: RandomTeamsTypes.RandomSet[] = [];

		const baseFormes: {[k: string]: number} = {};

		const tierCount: {[k: string]: number} = {};
		const typeCount: {[k: string]: number} = {};
		const typeComboCount: {[k: string]: number} = {};
		const teamDetails: RandomTeamsTypes.TeamDetails = {};

		const pokemonPool = this.getFestivePokemonPool();
		while (pokemonPool.length && pokemon.length < this.maxTeamSize) {
			const species = this.dex.species.get(this.sampleNoReplace(pokemonPool));
			if (!species.exists) continue;

			// Check if the forme has moves for random battle
			if ((this.format.gameType === 'singles') || (this.format.gameType === 'freeforall') || (this.format.gameType === 'multi')) {
				if (!species.randomBattleMoves) continue;
			} else {
				if (!species.randomDoubleBattleMoves) continue;
			}

			// Limit to one of each species (Species Clause)
			if (baseFormes[species.baseSpecies]) continue;

			// Adjust rate for species with multiple sets
			switch (species.baseSpecies) {
			case 'Arceus': case 'Silvally':
				if (this.randomChance(8, 9)) continue;
				break;
			case 'Aegislash': case 'Basculin': case 'Gourgeist': case 'Meloetta':
				if (this.randomChance(1, 2)) continue;
				break;
			case 'Greninja':
				if (this.gen >= 7 && this.randomChance(1, 2)) continue;
				break;
			case 'Darmanitan':
				if (species.gen === 8 && this.randomChance(1, 2)) continue;
				break;
			case 'Magearna': case 'Toxtricity': case 'Zacian': case 'Zamazenta': case 'Zarude':
			case 'Appletun': case 'Blastoise': case 'Butterfree': case 'Copperajah': case 'Grimmsnarl': case 'Inteleon': case 'Rillaboom': case 'Snorlax': case 'Urshifu':
				if (this.gen >= 8 && this.randomChance(1, 2)) continue;
				break;
			}

			// Illusion shouldn't be on the last slot
			if (species.name === 'Zoroark' && pokemon.length > 4) continue;

			const tier = species.tier;
			const types = species.types;
			const typeCombo = types.slice().sort().join();

			// Limit one Pokemon per tier, two for Monotype
			// if ((tierCount[tier] >= (isMonotype ? 2 : 1)) && !this.randomChance(1, Math.pow(5, tierCount[tier]))) {
			// 	continue;
			// }

			const set = this.randomSet(species, teamDetails, pokemon.length === 0, !['singles', 'freeforall'].includes(this.format.gameType), false);

			// Okay, the set passes, add it to our team
			pokemon.push(set);

			if (pokemon.length === this.maxTeamSize) {
				// Set Zoroark's level to be the same as the last Pokemon
				const illusion = teamDetails['illusion'];
				if (illusion) pokemon[illusion - 1].level = pokemon[5].level;

				// Don't bother tracking details for the 6th Pokemon
				break;
			}

			// Now that our Pokemon has passed all checks, we can increment our counters
			baseFormes[species.baseSpecies] = 1;

			// Increment tier counter
			if (tierCount[tier]) {
				tierCount[tier]++;
			} else {
				tierCount[tier] = 1;
			}

			// Increment type counters
			for (const typeName of types) {
				if (typeName in typeCount) {
					typeCount[typeName]++;
				} else {
					typeCount[typeName] = 1;
				}
			}
			if (typeCombo in typeComboCount) {
				typeComboCount[typeCombo]++;
			} else {
				typeComboCount[typeCombo] = 1;
			}

			// Track what the team has
			if (set.ability === 'Drizzle' || set.moves.includes('raindance')) teamDetails['rain'] = 1;
			if (set.ability === 'Drought' || set.moves.includes('sunnyday')) teamDetails['sun'] = 1;
			if (set.ability === 'Sand Stream') teamDetails['sand'] = 1;
			if (set.ability === 'Snow Warning') teamDetails['hail'] = 1;
			if (set.moves.includes('spikes')) teamDetails['spikes'] = (teamDetails['spikes'] || 0) + 1;
			if (set.moves.includes('stealthrock')) teamDetails['stealthRock'] = 1;
			if (set.moves.includes('stickyweb')) teamDetails['stickyWeb'] = 1;
			if (set.moves.includes('toxicspikes')) teamDetails['toxicSpikes'] = 1;
			if (set.moves.includes('defog')) teamDetails['defog'] = 1;
			if (set.moves.includes('rapidspin')) teamDetails['rapidSpin'] = 1;
			if (set.moves.includes('auroraveil') || set.moves.includes('reflect') && set.moves.includes('lightscreen')) teamDetails['screens'] = 1;

			// For setting Zoroark's level
			if (set.ability === 'Illusion') teamDetails['illusion'] = pokemon.length;
		}

		if (pokemon.length < this.maxTeamSize) throw new Error(`Could not build a random team for ${this.format} (seed=${seed})`);

		return pokemon;
	}

	getIrishPokemonPool(pokemon: RandomTeamsTypes.RandomSet[] = []) {
		const exclude = pokemon.map(p => toID(p.species));
		const pokemonPool = [];
		for (const id in this.dex.data.FormatsData) {
			const species = this.dex.species.get(id);
			if (species.gen > this.gen || exclude.includes(species.id)) continue;
			if (toID(species.color) !== 'green') continue;
			if (species.num <= 69000 || species.num > 69386) continue;
			pokemonPool.push(id);
		}
		return pokemonPool;
	}

	randomIrishTeam() {
		const seed = this.prng.seed;
		const pokemon: RandomTeamsTypes.RandomSet[] = [];

		const baseFormes: {[k: string]: number} = {};

		const tierCount: {[k: string]: number} = {};
		const typeCount: {[k: string]: number} = {};
		const typeComboCount: {[k: string]: number} = {};
		const teamDetails: RandomTeamsTypes.TeamDetails = {};

		const pokemonPool = this.getIrishPokemonPool();
		while (pokemonPool.length && pokemon.length < this.maxTeamSize) {
			const species = this.dex.species.get(this.sampleNoReplace(pokemonPool));
			if (!species.exists) continue;

			// Check if the forme has moves for random battle
			if ((this.format.gameType === 'singles') || (this.format.gameType === 'freeforall') || (this.format.gameType === 'multi')) {
				if (!species.randomBattleMoves) continue;
			} else {
				if (!species.randomDoubleBattleMoves) continue;
			}

			// Limit to one of each species (Species Clause)
			if (baseFormes[species.baseSpecies]) continue;

			// Adjust rate for species with multiple sets
			switch (species.baseSpecies) {
			case 'Arceus': case 'Silvally':
				if (this.randomChance(8, 9)) continue;
				break;
			case 'Aegislash': case 'Basculin': case 'Gourgeist': case 'Meloetta':
				if (this.randomChance(1, 2)) continue;
				break;
			case 'Greninja':
				if (this.gen >= 7 && this.randomChance(1, 2)) continue;
				break;
			case 'Darmanitan':
				if (species.gen === 8 && this.randomChance(1, 2)) continue;
				break;
			case 'Magearna': case 'Toxtricity': case 'Zacian': case 'Zamazenta': case 'Zarude':
			case 'Appletun': case 'Blastoise': case 'Butterfree': case 'Copperajah': case 'Grimmsnarl': case 'Inteleon': case 'Rillaboom': case 'Snorlax': case 'Urshifu':
				if (this.gen >= 8 && this.randomChance(1, 2)) continue;
				break;
			}

			// Illusion shouldn't be on the last slot
			if (species.name === 'Zoroark' && pokemon.length > 4) continue;

			const tier = species.tier;
			const types = species.types;
			const typeCombo = types.slice().sort().join();

			// Limit one Pokemon per tier, two for Monotype
			// if ((tierCount[tier] >= (isMonotype ? 2 : 1)) && !this.randomChance(1, Math.pow(5, tierCount[tier]))) {
			// 	continue;
			// }

			const set = this.randomSet(species, teamDetails, pokemon.length === 0, !['singles', 'freeforall'].includes(this.format.gameType), false);

			// Okay, the set passes, add it to our team
			pokemon.push(set);

			if (pokemon.length === this.maxTeamSize) {
				// Set Zoroark's level to be the same as the last Pokemon
				const illusion = teamDetails['illusion'];
				if (illusion) pokemon[illusion - 1].level = pokemon[5].level;

				// Don't bother tracking details for the 6th Pokemon
				break;
			}

			// Now that our Pokemon has passed all checks, we can increment our counters
			baseFormes[species.baseSpecies] = 1;

			// Increment tier counter
			if (tierCount[tier]) {
				tierCount[tier]++;
			} else {
				tierCount[tier] = 1;
			}

			// Increment type counters
			for (const typeName of types) {
				if (typeName in typeCount) {
					typeCount[typeName]++;
				} else {
					typeCount[typeName] = 1;
				}
			}
			if (typeCombo in typeComboCount) {
				typeComboCount[typeCombo]++;
			} else {
				typeComboCount[typeCombo] = 1;
			}

			// Track what the team has
			if (set.ability === 'Drizzle' || set.moves.includes('raindance')) teamDetails['rain'] = 1;
			if (set.ability === 'Drought' || set.moves.includes('sunnyday')) teamDetails['sun'] = 1;
			if (set.ability === 'Sand Stream') teamDetails['sand'] = 1;
			if (set.ability === 'Snow Warning') teamDetails['hail'] = 1;
			if (set.moves.includes('spikes')) teamDetails['spikes'] = (teamDetails['spikes'] || 0) + 1;
			if (set.moves.includes('stealthrock')) teamDetails['stealthRock'] = 1;
			if (set.moves.includes('stickyweb')) teamDetails['stickyWeb'] = 1;
			if (set.moves.includes('toxicspikes')) teamDetails['toxicSpikes'] = 1;
			if (set.moves.includes('defog')) teamDetails['defog'] = 1;
			if (set.moves.includes('rapidspin')) teamDetails['rapidSpin'] = 1;
			if (set.moves.includes('auroraveil') || set.moves.includes('reflect') && set.moves.includes('lightscreen')) teamDetails['screens'] = 1;

			// For setting Zoroark's level
			if (set.ability === 'Illusion') teamDetails['illusion'] = pokemon.length;
		}

		if (pokemon.length < this.maxTeamSize) throw new Error(`Could not build a random team for ${this.format} (seed=${seed})`);

		return pokemon;
	}

	getSpookyPokemonPool(isCloveronly: boolean, pokemon: RandomTeamsTypes.RandomSet[] = []) {
		const exclude = pokemon.map(p => toID(p.species));
		const pokemonPool = [];
		for (const id in this.dex.data.FormatsData) {
			if (['shedinja', 'sprucifix'].includes(id)) continue;
			const species = this.dex.species.get(id);
			if (species.gen > this.gen || exclude.includes(species.id)) continue;
			if (!species.types.includes('Ghost') && !species.types.includes('Dark')) continue;
			if (isCloveronly) {
				if (species.num <= 69000 || species.num > 69386) continue;
			} else {
				if (species.num > 1000) continue;
			}
			pokemonPool.push(id);
		}
		return pokemonPool;
	}

	randomSpookyTeam() {
		const seed = this.prng.seed;
		const pokemon: RandomTeamsTypes.RandomSet[] = [];
		const ocbmon: RandomTeamsTypes.RandomSet[] = [];

		const baseFormes: {[k: string]: number} = {};

		const tierCount: {[k: string]: number} = {};
		const typeCount: {[k: string]: number} = {};
		const typeComboCount: {[k: string]: number} = {};
		const teamDetails: RandomTeamsTypes.TeamDetails = {};

		const pokemonPool = this.getSpookyPokemonPool(false);
		while (pokemonPool.length && pokemon.length < 3) {
			const species = this.dex.species.get(this.sampleNoReplace(pokemonPool));
			if (!species.exists) continue;

			// Check if the forme has moves for random battle
			if ((this.format.gameType === 'singles') || (this.format.gameType === 'freeforall') || (this.format.gameType === 'multi')) {
				if (!species.randomBattleMoves) continue;
			} else {
				if (!species.randomDoubleBattleMoves) continue;
			}

			// Limit to one of each species (Species Clause)
			if (baseFormes[species.baseSpecies]) continue;

			// Adjust rate for species with multiple sets
			switch (species.baseSpecies) {
			case 'Arceus': case 'Silvally':
				if (this.randomChance(8, 9)) continue;
				break;
			case 'Aegislash': case 'Basculin': case 'Gourgeist': case 'Meloetta':
				if (this.randomChance(1, 2)) continue;
				break;
			case 'Greninja':
				if (this.gen >= 7 && this.randomChance(1, 2)) continue;
				break;
			case 'Darmanitan':
				if (species.gen === 8 && this.randomChance(1, 2)) continue;
				break;
			case 'Magearna': case 'Toxtricity': case 'Zacian': case 'Zamazenta': case 'Zarude':
			case 'Appletun': case 'Blastoise': case 'Butterfree': case 'Copperajah': case 'Grimmsnarl': case 'Inteleon': case 'Rillaboom': case 'Snorlax': case 'Urshifu':
				if (this.gen >= 8 && this.randomChance(1, 2)) continue;
				break;
			}

			// Illusion shouldn't be on the last slot
			if (species.name === 'Zoroark' && pokemon.length > 4) continue;

			const tier = species.tier;
			const types = species.types;
			const typeCombo = types.slice().sort().join();

			// Limit one Pokemon per tier, two for Monotype
			// if ((tierCount[tier] >= (isMonotype ? 2 : 1)) && !this.randomChance(1, Math.pow(5, tierCount[tier]))) {
			// 	continue;
			// }

			const set = this.randomSet(species, teamDetails, pokemon.length === 0, !['singles', 'freeforall'].includes(this.format.gameType), false);

			// Okay, the set passes, add it to our team
			pokemon.push(set);

			if (pokemon.length === this.maxTeamSize) {
				// Set Zoroark's level to be the same as the last Pokemon
				const illusion = teamDetails['illusion'];
				if (illusion) pokemon[illusion - 1].level = pokemon[5].level;

				// Don't bother tracking details for the 6th Pokemon
				break;
			}

			// Now that our Pokemon has passed all checks, we can increment our counters
			baseFormes[species.baseSpecies] = 1;

			// Increment tier counter
			if (tierCount[tier]) {
				tierCount[tier]++;
			} else {
				tierCount[tier] = 1;
			}

			// Increment type counters
			for (const typeName of types) {
				if (typeName in typeCount) {
					typeCount[typeName]++;
				} else {
					typeCount[typeName] = 1;
				}
			}
			if (typeCombo in typeComboCount) {
				typeComboCount[typeCombo]++;
			} else {
				typeComboCount[typeCombo] = 1;
			}

			// Track what the team has
			if (set.ability === 'Drizzle' || set.moves.includes('raindance')) teamDetails['rain'] = 1;
			if (set.ability === 'Drought' || set.moves.includes('sunnyday')) teamDetails['sun'] = 1;
			if (set.ability === 'Sand Stream') teamDetails['sand'] = 1;
			if (set.ability === 'Snow Warning') teamDetails['hail'] = 1;
			if (set.moves.includes('spikes')) teamDetails['spikes'] = (teamDetails['spikes'] || 0) + 1;
			if (set.moves.includes('stealthrock')) teamDetails['stealthRock'] = 1;
			if (set.moves.includes('stickyweb')) teamDetails['stickyWeb'] = 1;
			if (set.moves.includes('toxicspikes')) teamDetails['toxicSpikes'] = 1;
			if (set.moves.includes('defog')) teamDetails['defog'] = 1;
			if (set.moves.includes('rapidspin')) teamDetails['rapidSpin'] = 1;
			if (set.moves.includes('auroraveil') || set.moves.includes('reflect') && set.moves.includes('lightscreen')) teamDetails['screens'] = 1;

			// For setting Zoroark's level
			if (set.ability === 'Illusion') teamDetails['illusion'] = pokemon.length;
		}

		const ocbmonPool = this.getSpookyPokemonPool(true);
		while (ocbmonPool.length && ocbmon.length < 3) {
			const species = this.dex.species.get(this.sampleNoReplace(ocbmonPool));
			if (!species.exists) continue;

			// Check if the forme has moves for random battle
			if ((this.format.gameType === 'singles') || (this.format.gameType === 'freeforall') || (this.format.gameType === 'multi')) {
				if (!species.randomBattleMoves) continue;
			} else {
				if (!species.randomDoubleBattleMoves) continue;
			}

			// Limit to one of each species (Species Clause)
			if (baseFormes[species.baseSpecies]) continue;

			// Adjust rate for species with multiple sets
			switch (species.baseSpecies) {
			case 'Arceus': case 'Silvally':
				if (this.randomChance(8, 9)) continue;
				break;
			case 'Aegislash': case 'Basculin': case 'Gourgeist': case 'Meloetta':
				if (this.randomChance(1, 2)) continue;
				break;
			case 'Greninja':
				if (this.gen >= 7 && this.randomChance(1, 2)) continue;
				break;
			case 'Darmanitan':
				if (species.gen === 8 && this.randomChance(1, 2)) continue;
				break;
			case 'Magearna': case 'Toxtricity': case 'Zacian': case 'Zamazenta': case 'Zarude':
			case 'Appletun': case 'Blastoise': case 'Butterfree': case 'Copperajah': case 'Grimmsnarl': case 'Inteleon': case 'Rillaboom': case 'Snorlax': case 'Urshifu':
				if (this.gen >= 8 && this.randomChance(1, 2)) continue;
				break;
			}

			// Illusion shouldn't be on the last slot
			if (species.name === 'Zoroark' && pokemon.length > 4) continue;

			const tier = species.tier;
			const types = species.types;
			const typeCombo = types.slice().sort().join();

			// Limit one Pokemon per tier, two for Monotype
			// if ((tierCount[tier] >= (isMonotype ? 2 : 1)) && !this.randomChance(1, Math.pow(5, tierCount[tier]))) {
			// 	continue;
			// }

			const set = this.randomSet(species, teamDetails, pokemon.length === 0, !['singles', 'freeforall'].includes(this.format.gameType), true);

			// Okay, the set passes, add it to our team
			pokemon.push(set);

			if (pokemon.length === this.maxTeamSize) {
				// Set Zoroark's level to be the same as the last Pokemon
				const illusion = teamDetails['illusion'];
				if (illusion) pokemon[illusion - 1].level = pokemon[5].level;

				// Don't bother tracking details for the 6th Pokemon
				break;
			}

			// Now that our Pokemon has passed all checks, we can increment our counters
			baseFormes[species.baseSpecies] = 1;

			// Increment tier counter
			if (tierCount[tier]) {
				tierCount[tier]++;
			} else {
				tierCount[tier] = 1;
			}

			// Increment type counters
			for (const typeName of types) {
				if (typeName in typeCount) {
					typeCount[typeName]++;
				} else {
					typeCount[typeName] = 1;
				}
			}
			if (typeCombo in typeComboCount) {
				typeComboCount[typeCombo]++;
			} else {
				typeComboCount[typeCombo] = 1;
			}

			// Track what the team has
			if (set.ability === 'Drizzle' || set.moves.includes('raindance')) teamDetails['rain'] = 1;
			if (set.ability === 'Drought' || set.moves.includes('sunnyday')) teamDetails['sun'] = 1;
			if (set.ability === 'Sand Stream') teamDetails['sand'] = 1;
			if (set.ability === 'Snow Warning') teamDetails['hail'] = 1;
			if (set.moves.includes('spikes')) teamDetails['spikes'] = (teamDetails['spikes'] || 0) + 1;
			if (set.moves.includes('stealthrock')) teamDetails['stealthRock'] = 1;
			if (set.moves.includes('stickyweb')) teamDetails['stickyWeb'] = 1;
			if (set.moves.includes('toxicspikes')) teamDetails['toxicSpikes'] = 1;
			if (set.moves.includes('defog')) teamDetails['defog'] = 1;
			if (set.moves.includes('rapidspin')) teamDetails['rapidSpin'] = 1;
			if (set.moves.includes('auroraveil') || set.moves.includes('reflect') && set.moves.includes('lightscreen')) teamDetails['screens'] = 1;

			// For setting Zoroark's level
			if (set.ability === 'Illusion') teamDetails['illusion'] = pokemon.length;
		}
		if ((pokemon.length + ocbmon.length) < this.maxTeamSize) throw new Error(`Could not build a random team for ${this.format} (seed=${seed})`);

		return [...pokemon, ...ocbmon];
	}

	getPokemonPool(type: string, pokemon: RandomTeamsTypes.RandomSet[] = [], isMonotype = false, legalInFormat = false) {
		const exclude = pokemon.map(p => toID(p.species));
		const pokemonPool = [];
		for (const id in this.dex.data.FormatsData) {
			let species = this.dex.species.get(id);
			if (species.gen > this.gen || exclude.includes(species.id)) continue;

			if (legalInFormat && species.isNonstandard !== null) continue;

			if (isMonotype) {
				if (!species.types.includes(type)) continue;
				if (typeof species.battleOnly === 'string') {
					species = this.dex.species.get(species.battleOnly);
					if (!species.types.includes(type)) continue;
				}
			}
			pokemonPool.push(id);
		}
		return pokemonPool;
	}

	randomTeam() {
		const seed = this.prng.seed;
		const ruleTable = this.dex.formats.getRuleTable(this.format);
		const pokemon: RandomTeamsTypes.RandomSet[] = [];

		// For Monotype
		const isMonotype = ruleTable.has('sametypeclause');
		const typePool = Object.keys(this.dex.data.TypeChart);
		const type = this.sample(typePool);

		// PotD stuff
		let potd: Species | false = false;
		if (global.Config && Config.potd && ruleTable.has('potd')) {
			potd = this.dex.species.get(Config.potd);
		}

		// Ocbmons
		const isCloveronly = this.format.id.includes('cloveronly');

		const baseFormes: {[k: string]: number} = {};

		const tierCount: {[k: string]: number} = {};
		const typeCount: {[k: string]: number} = {};
		const typeComboCount: {[k: string]: number} = {};
		const teamDetails: RandomTeamsTypes.TeamDetails = {};

		const pokemonPool = this.getPokemonPool(type, pokemon, isMonotype, isCloveronly);
		while (pokemonPool.length && pokemon.length < this.maxTeamSize) {
			let species = this.dex.species.get(this.sampleNoReplace(pokemonPool));
			if (!species.exists) continue;
			if (pokemon.length === 0 && this.noLead.includes(toID(species.name))) continue;

			// Check if the forme has moves for random battle
			if ((this.format.gameType === 'singles') || (this.format.gameType === 'freeforall') || (this.format.gameType === 'multi')) {
				if (!species.randomBattleMoves) continue;
			} else {
				if (!species.randomDoubleBattleMoves) continue;
			}

			// Limit to one of each species (Species Clause)
			if (baseFormes[species.baseSpecies]) continue;

			// Adjust rate for species with multiple sets
			switch (species.baseSpecies) {
			case 'Arceus': case 'Silvally':
				if (this.randomChance(8, 9) && !isMonotype) continue;
				break;
			case 'Aegislash': case 'Basculin': case 'Gourgeist': case 'Meloetta':
				if (this.randomChance(1, 2)) continue;
				break;
			case 'Greninja':
				if (this.gen >= 7 && this.randomChance(1, 2)) continue;
				break;
			case 'Darmanitan':
				if (species.gen === 8 && this.randomChance(1, 2)) continue;
				break;
			case 'Magearna': case 'Toxtricity': case 'Zacian': case 'Zamazenta': case 'Zarude':
			case 'Appletun': case 'Blastoise': case 'Butterfree': case 'Copperajah': case 'Grimmsnarl': case 'Inteleon': case 'Rillaboom': case 'Snorlax': case 'Urshifu':
				if (this.gen >= 8 && this.randomChance(1, 2)) continue;
				break;
			}

			// Illusion shouldn't be on the last slot
			if (species.name === 'Zoroark' && pokemon.length > 4) continue;

			const tier = species.tier;
			const types = species.types;
			const typeCombo = types.slice().sort().join();

			// Limit one Pokemon per tier, two for Monotype
			// if ((tierCount[tier] >= (isMonotype ? 2 : 1)) && !this.randomChance(1, Math.pow(5, tierCount[tier]))) {
			// 	continue;
			// }

			if (!isMonotype) {
				// Limit two of any type
				let skip = false;
				for (const typeName of types) {
					if (typeCount[typeName] > 1) {
						skip = true;
						break;
					}
				}
				if (skip) continue;
			}

			// Limit one of any type combination, two in Monotype
			if (typeComboCount[typeCombo] >= (isMonotype ? 2 : 1)) continue;

			// The Pokemon of the Day
			if (!!potd && potd.exists && pokemon.length === 1) species = potd;

			const set = this.randomSet(species, teamDetails, pokemon.length === 0, !['singles', 'freeforall'].includes(this.format.gameType), isCloveronly);

			// Okay, the set passes, add it to our team
			pokemon.push(set);

			if (pokemon.length === this.maxTeamSize) {
				// Set Zoroark's level to be the same as the last Pokemon
				const illusion = teamDetails['illusion'];
				if (illusion) pokemon[illusion - 1].level = pokemon[5].level;

				// Don't bother tracking details for the 6th Pokemon
				break;
			}

			// Now that our Pokemon has passed all checks, we can increment our counters
			baseFormes[species.baseSpecies] = 1;

			// Increment tier counter
			if (tierCount[tier]) {
				tierCount[tier]++;
			} else {
				tierCount[tier] = 1;
			}

			// Increment type counters
			for (const typeName of types) {
				if (typeName in typeCount) {
					typeCount[typeName]++;
				} else {
					typeCount[typeName] = 1;
				}
			}
			if (typeCombo in typeComboCount) {
				typeComboCount[typeCombo]++;
			} else {
				typeComboCount[typeCombo] = 1;
			}

			// Track what the team has
			if (set.ability === 'Drizzle' || set.moves.includes('raindance')) teamDetails['rain'] = 1;
			if (set.ability === 'Drought' || set.moves.includes('sunnyday')) teamDetails['sun'] = 1;
			if (set.ability === 'Sand Stream') teamDetails['sand'] = 1;
			if (set.ability === 'Snow Warning') teamDetails['hail'] = 1;
			if (set.moves.includes('spikes')) teamDetails['spikes'] = (teamDetails['spikes'] || 0) + 1;
			if (set.moves.includes('stealthrock')) teamDetails['stealthRock'] = 1;
			if (set.moves.includes('stickyweb')) teamDetails['stickyWeb'] = 1;
			if (set.moves.includes('toxicspikes')) teamDetails['toxicSpikes'] = 1;
			if (set.moves.includes('defog')) teamDetails['defog'] = 1;
			if (set.moves.includes('rapidspin')) teamDetails['rapidSpin'] = 1;
			if (set.moves.includes('auroraveil') || set.moves.includes('reflect') && set.moves.includes('lightscreen')) teamDetails['screens'] = 1;

			// For setting Zoroark's level
			if (set.ability === 'Illusion') teamDetails['illusion'] = pokemon.length;
		}
		if (pokemon.length < this.maxTeamSize) throw new Error(`Could not build a random team for ${this.format} (seed=${seed})`);

		return pokemon;
	}
}

export default RandomTeams;
