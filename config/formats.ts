// Note: This is the list of formats
// The rules that formats use are stored in data/rulesets.ts
/*
If you want to add custom formats, create a file in this folder named: 'custom-formats.ts'

Paste the following code into the file and add your desired formats and their sections between the brackets:
--------------------------------------------------------------------------------
// Note: This is the list of formats
// The rules that formats use are stored in data/rulesets.ts

export const Formats: FormatList = [
];
--------------------------------------------------------------------------------

If you specify a section that already exists, your format will be added to the bottom of that section.
New sections will be added to the bottom of the specified column.
The column value will be ignored for repeat sections.
*/

export const Formats: FormatList = [
	
	///////////////////////////////////////////////////////////////////
	// Wack
	///////////////////////////////////////////////////////////////////
	// {
	// 	section: 'Wack (HEAVY WIP)',
	// 	column: 2,
	// },
	// {
	// 	name: '[Gen 8 Wack Only] OU',
	// 	mod: 'wack',
	// 	ruleset: [
	// 		'Terastal Clause',
	// 		'Standard',
	// 		'! Nickname Clause',
	// 		'Dynamax Clause',
	// 		'Overflow Stat Mod',

	// 	],
	// 	banlist: [
	// 		'Uber', 'Arena Trap', 'Moody', 'Sand Veil', 'Snow Cloak', 'Computer Bug', 'Baton Pass', 'Gods Endurance', 'Shadow Tag', 'Wonder Guard', 'Wacky',
	// 		'Abyssal Hell Drag', 'Twindeath', 'Desecrations', 'Extreme Evoboost', 'Pillow Pile', 'Adaptive Body', 'Divine Protection', 'Hot Coals',
	// 		'Cryaa', 'aaryC', 'Drizzle', 'Drought', 'Snow Warning', 'Sand Stream', 'Shadow Call', 'Acid Cloudburst', 'Thunderstorm', 'Freezing Kiss',
	// 		'Corrupt Orb', 'Border Wall', 'Ultra Cloak', 'Ultra Scarf', 'Pitch Sludge', 'Apex Orb', 'Antiplebshield', 'GODSORB', 'Sans Hoodie',
	// 		'Ginsio Berry', 'Uranus Orb', 'Ballet Outfit', 'Frost Orb', 'Nap Orb', 'Ethereal', 'Glass Armor', 'Fangclaw', 'Craggy Helmet', 'Discombubbles',
	// 		'Bootsofblindingspeed + Bestow', 'Bootsofblindingspeed + Trick', 'Bootsofblindingspeed + Switcheroo', 'Inverted Rune', 'Sheriff Hat',
	// 		'Hell Drag', 'Pacify', 'Rift Strike', 'Perfect Freeze', 'Time Stasis', 'Suwise Glasses', 'Pressure Orb', 'Training Glove', 'Wire Trap', 'Sketch', 'Soul Barrier',
	// 	],
	// },
	// {
	// 	name: '[Gen 8 Wack Only] UU',
	// 	mod: 'wack',
	// 	ruleset: [
	// 		'Terastal Clause',
	// 		'Standard',
	// 		'! Nickname Clause',
	// 		'Dynamax Clause',
	// 		'Overflow Stat Mod',

	// 	],
	// 	banlist: [
	// 		'OU', 'UUBL', 'Arena Trap', 'Moody', 'Sand Veil', 'Snow Cloak', 'Computer Bug', 'Baton Pass', 'Gods Endurance', 'Shadow Tag', 'Wonder Guard', 'Wacky',
	// 		'Abyssal Hell Drag', 'Twindeath', 'Desecrations', 'Extreme Evoboost', 'Pillow Pile', 'Adaptive Body', 'Divine Protection', 'Hot Coals',
	// 		'Cryaa', 'aaryC', 'Drizzle', 'Drought', 'Snow Warning', 'Sand Stream', 'Shadow Call', 'Acid Cloudburst', 'Thunderstorm', 'Freezing Kiss',
	// 		'Corrupt Orb', 'Border Wall', 'Ultra Cloak', 'Ultra Scarf', 'Pitch Sludge', 'Apex Orb', 'Antiplebshield', 'GODSORB', 'Sans Hoodie',
	// 		'Ginsio Berry', 'Uranus Orb', 'Ballet Outfit', 'Frost Orb', 'Nap Orb', 'Ethereal', 'Glass Armor', 'Fangclaw', 'Craggy Helmet', 'Discombubbles',
	// 		'Bootsofblindingspeed + Bestow', 'Bootsofblindingspeed + Trick', 'Bootsofblindingspeed + Switcheroo', 'Inverted Rune', 'Sheriff Hat',
	// 		'Hell Drag', 'Pacify', 'Rift Strike', 'Perfect Freeze', 'Time Stasis', 'Suwise Glasses', 'Pressure Orb', 'Training Glove', 'Wire Trap', 'Sketch', 'Soul Barrier',
	// 	],
	// },
	// {
	// 	name: '[Gen 8 Wack Only] Ubers',
	// 	mod: 'wack',
	// 	ruleset: [
	// 		'Terastal Clause',
	// 		'Standard',
	// 		'! Nickname Clause',
	// 		'Dynamax Clause',
	// 		'Overflow Stat Mod',
	// 		'Sketch Post-Gen 7 Moves',
	// 	],
	// 	banlist: [
	// 		'Arena Trap', 'Moody', 'Sand Veil', 'Snow Cloak', 'Computer Bug', 'Baton Pass', 'Gods Endurance', 'Shadow Tag', 'Wonder Guard', 'Wacky',
	// 		'Abyssal Hell Drag', 'Twindeath', 'Desecrations', 'Extreme Evoboost',
	// 		'Cryaa', 'aaryC', 'Drizzle', 'Drought', 'Snow Warning', 'Sand Stream', 'Shadow Call', 'Acid Cloudburst', 'Thunderstorm',
	// 		'Corrupt Orb', 'Border Wall', 'Ultra Cloak', 'Ultra Scarf', 'Pitch Sludge', 'Apex Orb', 'Antiplebshield', 'GODSORB', 'Sans Hoodie',
	// 		'Ginsio Berry', 'Uranus Orb', 'Ballet Outfit', 'Frost Orb', 'Nap Orb', 'Ethereal', 'Glass Armor', 'Fangclaw', 'Craggy Helmet',
	// 		'Bootsofblindingspeed + Bestow', 'Bootsofblindingspeed + Trick', 'Bootsofblindingspeed + Switcheroo', 'Inverted Rune', 'Sheriff Hat',
	// 		'Hell Drag', 'Pacify', 'Rift Strike', 'Perfect Freeze', 'Time Stasis',
	// 	],
	// },
	// {
	// 	name: '[Gen 8 Wack Only] NFE',
	// 	mod: 'wack',
	// 	ruleset: [
	// 		'Terastal Clause',
	// 		'Not Fully Evolved',
	// 		'Standard',
	// 		'! Nickname Clause',
	// 		'Dynamax Clause',
	// 		'Overflow Stat Mod',
	// 		'Sketch Post-Gen 7 Moves',
	// 	],
	// 	banlist: [
	// 		'Arena Trap', 'Moody', 'Sand Veil', 'Snow Cloak', 'Computer Bug', 'Baton Pass', 'Gods Endurance', 'Shadow Tag', 'Wonder Guard', 'Wacky',
	// 		'Abyssal Hell Drag', 'Twindeath', 'Desecrations', 'Extreme Evoboost',
	// 		'Cryaa', 'aaryC', 'Drizzle', 'Drought', 'Snow Warning', 'Sand Stream', 'Shadow Call', 'Acid Cloudburst', 'Thunderstorm',
	// 		'Corrupt Orb', 'Border Wall', 'Ultra Cloak', 'Ultra Scarf', 'Pitch Sludge', 'Apex Orb', 'Antiplebshield', 'GODSORB', 'Sans Hoodie',
	// 		'Ginsio Berry', 'Uranus Orb', 'Ballet Outfit', 'Frost Orb', 'Nap Orb', 'Ethereal', 'Glass Armor', 'Fangclaw', 'Craggy Helmet',
	// 		'Bootsofblindingspeed + Bestow', 'Bootsofblindingspeed + Trick', 'Bootsofblindingspeed + Switcheroo', 'Inverted Rune', 'Sheriff Hat',
	// 		'Hell Drag', 'Pacify', 'Rift Strike', 'Perfect Freeze', 'Time Stasis',
	// 	],
	// },
	// {
	// 	name: '[Gen 8 Wack Only] LC',
	// 	mod: 'wack',
	// 	ruleset: [
	// 		'Terastal Clause',
	// 		'Little Cup',
	// 		'Standard',
	// 		'! Nickname Clause',
	// 		'Dynamax Clause',
	// 		'Overflow Stat Mod',
	// 		'Sketch Post-Gen 7 Moves',
	// 	],
	// 	banlist: [
	// 		'Arena Trap', 'Moody', 'Sand Veil', 'Snow Cloak', 'Computer Bug', 'Baton Pass', 'Gods Endurance', 'Shadow Tag', 'Wonder Guard', 'Wacky',
	// 		'Abyssal Hell Drag', 'Twindeath', 'Desecrations', 'Extreme Evoboost',
	// 		'Cryaa', 'aaryC', 'Drizzle', 'Drought', 'Snow Warning', 'Sand Stream', 'Shadow Call', 'Acid Cloudburst', 'Thunderstorm',
	// 		'Corrupt Orb', 'Border Wall', 'Ultra Cloak', 'Ultra Scarf', 'Pitch Sludge', 'Apex Orb', 'Antiplebshield', 'GODSORB', 'Sans Hoodie',
	// 		'Ginsio Berry', 'Uranus Orb', 'Ballet Outfit', 'Frost Orb', 'Nap Orb', 'Ethereal', 'Glass Armor', 'Fangclaw', 'Craggy Helmet',
	// 		'Bootsofblindingspeed + Bestow', 'Bootsofblindingspeed + Trick', 'Bootsofblindingspeed + Switcheroo', 'Inverted Rune', 'Sheriff Hat',
	// 		'Hell Drag', 'Pacify', 'Rift Strike', 'Perfect Freeze', 'Time Stasis',
	// 	],
	// },
	// {
	// 	name: '[Gen 8 Wack Only] Monotype',
	// 	mod: 'wack',
	// 	ruleset: [
	// 		'Terastal Clause',
	// 		'Same Type Clause',
	// 		'Standard',
	// 		'! Nickname Clause',
	// 		'Dynamax Clause',
	// 		'Overflow Stat Mod',
	// 		'Sketch Post-Gen 7 Moves',
	// 	],
	// 	banlist: [
	// 		'Uber', 'Arena Trap', 'Moody', 'Sand Veil', 'Snow Cloak', 'Computer Bug', 'Baton Pass', 'Gods Endurance', 'Shadow Tag', 'Wonder Guard', 'Wacky',
	// 		'Abyssal Hell Drag', 'Twindeath', 'Desecrations', 'Extreme Evoboost',
	// 		'Cryaa', 'aaryC', 'Drizzle', 'Drought', 'Snow Warning', 'Sand Stream', 'Shadow Call', 'Acid Cloudburst', 'Thunderstorm',
	// 		'Corrupt Orb', 'Border Wall', 'Ultra Cloak', 'Ultra Scarf', 'Pitch Sludge', 'Apex Orb', 'Antiplebshield', 'GODSORB', 'Sans Hoodie',
	// 		'Ginsio Berry', 'Uranus Orb', 'Ballet Outfit', 'Frost Orb', 'Nap Orb', 'Ethereal', 'Glass Armor', 'Fangclaw', 'Craggy Helmet',
	// 		'Bootsofblindingspeed + Bestow', 'Bootsofblindingspeed + Trick', 'Bootsofblindingspeed + Switcheroo', 'Inverted Rune', 'Sheriff Hat',
	// 		'Hell Drag', 'Pacify', 'Rift Strike', 'Perfect Freeze', 'Time Stasis',
	// 	],
	// },
	// {
	// 	name: '[Gen 8 Wack Only] Anything Goes',
	// 	mod: 'wack',
	// 	ruleset: [
	// 		'Terastal Clause',
	// 		'Obtainable',
	// 		'Dynamax Clause',
	// 		'Team Preview',
	// 		'Overflow Stat Mod',
	// 		'Sketch Post-Gen 7 Moves',
	// 	],
	// 	banlist: [
	// 		'Antiplebshield',
	// 	],
	// },
	// {
	// 	name: '[Gen 8 Wack Only] Doubles OU',
	// 	mod: 'wack',
	// 	gameType: 'doubles',
	// 	ruleset: [
	// 		'Terastal Clause',
	// 		'Standard',
	// 		'! Nickname Clause',
	// 		'Dynamax Clause',
	// 		'Swagger Clause',
	// 		'Overflow Stat Mod',
	// 		'Sketch Post-Gen 7 Moves',
	// 	],
	// 	banlist: ['DUber', 'Uber', 'Arena Trap', 'Moody', 'Sand Veil', 'Snow Cloak', 'Computer Bug', 'Baton Pass', 'Gods Endurance', 'Shadow Tag', 'Wonder Guard', 'Wacky',
	// 		'Abyssal Hell Drag', 'Twindeath', 'Desecrations', 'Extreme Evoboost',
	// 		'Cryaa', 'aaryC', 'Drizzle', 'Drought', 'Snow Warning', 'Sand Stream', 'Shadow Call', 'Acid Cloudburst', 'Thunderstorm',
	// 		'Corrupt Orb', 'Border Wall', 'Ultra Cloak', 'Ultra Scarf', 'Pitch Sludge', 'Apex Orb', 'Antiplebshield', 'GODSORB', 'Sans Hoodie',
	// 		'Ginsio Berry', 'Uranus Orb', 'Ballet Outfit', 'Frost Orb', 'Nap Orb', 'Ethereal', 'Glass Armor', 'Fangclaw', 'Craggy Helmet',
	// 		'Bootsofblindingspeed + Bestow', 'Bootsofblindingspeed + Trick', 'Bootsofblindingspeed + Switcheroo', 'Inverted Rune', 'Sheriff Hat',
	// 		'Hell Drag', 'Pacify', 'Rift Strike', 'Perfect Freeze', 'Time Stasis',
	// 	],
	// },
	// {
	// 	name: '[Gen 8 Wack Only] Triples OU',
	// 	mod: 'wack',
	// 	gameType: 'triples',
	// 	searchShow: false,
	// 	rated: false,
	// 	ruleset: [
	// 		'Terastal Clause',
	// 		'Standard',
	// 		'! Nickname Clause',
	// 		'Dynamax Clause',
	// 		'Swagger Clause',
	// 		'Overflow Stat Mod',
	// 		'Sketch Post-Gen 7 Moves',
	// 	],
	// 	banlist: ['DUber', 'Uber', 'Arena Trap', 'Moody', 'Sand Veil', 'Snow Cloak', 'Computer Bug', 'Baton Pass', 'Gods Endurance', 'Shadow Tag', 'Wonder Guard', 'Wacky',
	// 		'Abyssal Hell Drag', 'Twindeath', 'Desecrations', 'Extreme Evoboost',
	// 		'Cryaa', 'aaryC', 'Drizzle', 'Drought', 'Snow Warning', 'Sand Stream', 'Shadow Call', 'Acid Cloudburst', 'Thunderstorm',
	// 		'Corrupt Orb', 'Border Wall', 'Ultra Cloak', 'Ultra Scarf', 'Pitch Sludge', 'Apex Orb', 'Antiplebshield', 'GODSORB', 'Sans Hoodie',
	// 		'Ginsio Berry', 'Uranus Orb', 'Ballet Outfit', 'Frost Orb', 'Nap Orb', 'Ethereal', 'Glass Armor', 'Fangclaw', 'Craggy Helmet',
	// 		'Bootsofblindingspeed + Bestow', 'Bootsofblindingspeed + Trick', 'Bootsofblindingspeed + Switcheroo', 'Inverted Rune', 'Sheriff Hat',
	// 		'Hell Drag', 'Pacify', 'Rift Strike', 'Perfect Freeze', 'Time Stasis',
	// 	],
	// },
	// {
	// 	name: '[Gen 8 Wack Only] Random Battle',
	// 	mod: 'wack',
	// 	team: 'random',
	// 	ruleset: ['Terastal Clause', 'Dynamax Clause', 'HP Percentage Mod', 'Cancel Mod'],
	// },
	// {
	// 	name: '[Gen 8 Wack Only] Pick Your Team Random Battle',
	// 	mod: 'wack',
	// 	team: 'random',
	// 	ruleset: ['Terastal Clause', 'Sleep Clause Mod', 'Picked Team Size = 6', 'Max Team Size = 12', 'Team Preview', 'Dynamax Clause', 'HP Percentage Mod', 'Cancel Mod'],
	// },
	// {
	// 	name: '[Gen 8 Wack Only] FFA Random Battle',
	// 	mod: 'wack',
	// 	team: 'random',
	// 	gameType: 'freeforall',
	// 	tournamentShow: false,
	// 	rated: false,
	// 	ruleset: ['Terastal Clause', 'Dynamax Clause', 'Species Clause', 'HP Percentage Mod', 'Cancel Mod', 'Sleep Clause Mod'],
	// },
	///////////////////////////////////////////////////////////////////
	// Wack OMs
	///////////////////////////////////////////////////////////////////
	{
		section: 'Wack OMs',
		column: 2,
	},
	{
		name: '[Gen 8 Wack Only] FFA Battle',
		mod: 'wack',
		gameType: 'freeforall',
		searchShow: false,
		rated: false,
		ruleset: [
			'Terastal Clause',
			'Standard',
			'! Nickname Clause',
			'Dynamax Clause',
			'Swagger Clause',
			'Overflow Stat Mod',
			'Sketch Post-Gen 7 Moves',
		],
		banlist: ['DUber', 'Uber', 'Arena Trap', 'Moody', 'Sand Veil', 'Snow Cloak', 'Computer Bug', 'Baton Pass', 'Gods Endurance', 'Shadow Tag', 'Wonder Guard', 'Wacky',
			'Abyssal Hell Drag', 'Twindeath', 'Desecrations', 'Extreme Evoboost',
			'Cryaa', 'aaryC', 'Drizzle', 'Drought', 'Snow Warning', 'Sand Stream', 'Shadow Call', 'Acid Cloudburst', 'Thunderstorm',
			'Corrupt Orb', 'Border Wall', 'Ultra Cloak', 'Ultra Scarf', 'Pitch Sludge', 'Apex Orb', 'Antiplebshield', 'GODSORB', 'Sans Hoodie',
			'Ginsio Berry', 'Uranus Orb', 'Ballet Outfit', 'Frost Orb', 'Nap Orb', 'Ethereal', 'Glass Armor', 'Fangclaw', 'Craggy Helmet',
			'Bootsofblindingspeed + Bestow', 'Bootsofblindingspeed + Trick', 'Bootsofblindingspeed + Switcheroo', 'Inverted Rune', 'Sheriff Hat',
			'Hell Drag', 'Pacify', 'Rift Strike', 'Perfect Freeze', 'Time Stasis',
		],
	},
	{
		name: "[Gen 8 Wack Only] Multi Battle",

		mod: 'wack',
		gameType: 'multi',
		searchShow: false,
		rated: false,
		ruleset: [
			'Terastal Clause',
			'Standard',
			'! Nickname Clause',
			'Dynamax Clause',
			'Swagger Clause',
			'Overflow Stat Mod',
			'Sketch Post-Gen 7 Moves',
		],
		banlist: ['DUber', 'Uber', 'Arena Trap', 'Moody', 'Sand Veil', 'Snow Cloak', 'Computer Bug', 'Baton Pass', 'Gods Endurance', 'Shadow Tag', 'Wonder Guard', 'Wacky',
			'Abyssal Hell Drag', 'Twindeath', 'Desecrations', 'Extreme Evoboost',
			'Cryaa', 'aaryC', 'Drizzle', 'Drought', 'Snow Warning', 'Sand Stream', 'Shadow Call', 'Acid Cloudburst', 'Thunderstorm',
			'Corrupt Orb', 'Border Wall', 'Ultra Cloak', 'Ultra Scarf', 'Pitch Sludge', 'Apex Orb', 'Antiplebshield', 'GODSORB', 'Sans Hoodie',
			'Ginsio Berry', 'Uranus Orb', 'Ballet Outfit', 'Frost Orb', 'Nap Orb', 'Ethereal', 'Glass Armor', 'Fangclaw', 'Craggy Helmet',
			'Bootsofblindingspeed + Bestow', 'Bootsofblindingspeed + Trick', 'Bootsofblindingspeed + Switcheroo', 'Inverted Rune', 'Sheriff Hat',
			'Hell Drag', 'Pacify', 'Rift Strike', 'Perfect Freeze', 'Time Stasis',
		],
	},
	{
		name: '[Gen 8 Wack Only] Custom Game',
		mod: 'wack',
		searchShow: false,
		rated: false,
		debug: true,
		battle: {trunc: Math.trunc},
		ruleset: ['Terastal Clause', 'Team Preview', 'Cancel Mod', 'Max Team Size = 24', 'Max Move Count = 24', 'Max Level = 9999', 'Default Level = 100', 'Overflow Stat Mod'],
	},
	{
		name: '[Gen 8 Wack Only] Custom Game (Doubles)',
		mod: 'wack',
		gameType: 'doubles',
		searchShow: false,
		rated: false,
		debug: true,
		battle: {trunc: Math.trunc},
		ruleset: ['Terastal Clause', 'Team Preview', 'Cancel Mod', 'Max Team Size = 24', 'Max Move Count = 24', 'Max Level = 9999', 'Default Level = 100', 'Overflow Stat Mod'],
	},
	///////////////////////////////////////////////////////////////////
	// CAP & Cope
	///////////////////////////////////////////////////////////////////
	{
		section: 'CAP & Cope',
		column: 2,
	},
	{
		name: '[Gen 8 Clover CAP Only] Ubers',
		mod: 'clovercap',
		ruleset: [
			'Terastal Clause',
			'Standard',
			'! Nickname Clause',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
		],
		banlist: ['Baton Pass', 'AG'],
	},
	{
		name: '[Gen 8 Clover CAP Only] OU',
		mod: 'clovercap',
		ruleset: [
			'Terastal Clause',
			'Standard',
			'! Nickname Clause',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
		],
		banlist: ['Uber', 'Arena Trap', 'Moody', 'Power Construct', 'Shadow Tag', 'Baton Pass', 'Wonder Guard', 'Condoom + Unaware'],
	},
	{
		name: '[Gen 8 Clover CAP Only] NFE',
		mod: 'clovercap',
		ruleset: [
			'Terastal Clause',
			'Not Fully Evolved',
			'Standard',
			'! Nickname Clause',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
		],
		banlist: ['Baton Pass', 'Arena Trap', 'Moody', 'Power Construct', 'Shadow Tag', 'Wonder Guard', 'Goblazer'],
	},
	{
		name: '[Gen 8 Clover CAP Only] LC',
		mod: 'clovercap',
		ruleset: [
			'Terastal Clause',
			'Little Cup',
			'Standard',
			'! Nickname Clause',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
		],
		banlist: ['Moody', 'Baton Pass', 'Dragon Rage', 'Sonic Boom', 'Ribbizap', 'Cursed Fang', 'Crimson Lens', 'Dinomight', 'Sphare', 'Yuukiino', 'Honrade'],
	},
	{
		name: '[Gen 8 Clover CAP Only] Monotype',
		mod: 'clovercap',
		ruleset: [
			'Terastal Clause',
			'Same Type Clause',
			'Standard',
			'! Nickname Clause',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
		],
		banlist: ['Uber', 'Arena Trap', 'Moody', 'Power Construct', 'Shadow Tag', 'Baton Pass', 'Wonder Guard', 'Condoom + Unaware'],
	},
	{
		name: "[Gen 8 Clover CAP Only] Pokebilities",
		desc: `Pok&eacute;mon have all of their released abilities simultaneously.`,
		mod: 'clovercap',
		searchShow: false,
		rated: false,
		ruleset: [
			'Terastal Clause',
			'Standard',
			'! Nickname Clause',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
		],
		banlist: [
			'Uber', 'Baton Pass',
			'Shadow Tag', 'Arena Trap', 'Moody',
			'Bunnorgy', 'Sprucifix', 'Traumobra',
			'Hohohoming', 'Condoom', 'Bluduck',
		],
		onBegin() {
			for (const pokemon of this.getAllPokemon()) {
				const ruleTable = this.dex.formats.getRuleTable(this.format);

				pokemon.m.innates = Object.keys(pokemon.species.abilities)
					.map(key => this.toID(pokemon.species.abilities[key as "0" | "1" | "H" | "S"]))
					.filter(ability => !ruleTable.isBanned(`ability:${ability}`))
					.filter(ability => ability !== pokemon.ability);
			}
		},
		onSwitchInPriority: 2,
		onSwitchIn(pokemon) {
			if (pokemon.m.innates) {
				for (const innate of pokemon.m.innates) {
					pokemon.addVolatile("ability:" + innate, pokemon);
				}
			}
		},
		onAfterMega(pokemon) {
			for (const innate of Object.keys(pokemon.volatiles).filter(i => i.startsWith('ability:'))) {
				pokemon.removeVolatile(innate);
			}
			pokemon.m.innates = undefined;
		},
	},
	{
		name: '[Gen 8 Clover CAP Only] Anything Goes',
		mod: 'clovercap',
		ruleset: ['Terastal Clause', 'Obtainable', 'Team Preview', 'HP Percentage Mod', 'Cancel Mod', 'Endless Battle Clause', 'Sketch Post-Gen 7 Moves', 'Dynamax Clause'],
	},
	{
		name: '[Gen 8 Clover CAP Only] Doubles OU',
		rated: false,
		mod: 'clovercap',
		gameType: 'doubles',
		ruleset: ['Terastal Clause', '[Gen 8 Clover CAP Only] OU'],
	},
	{
		name: '[Gen 8 Clover CAP Only] Random Battle',
		mod: 'clovercap',
		team: 'random',
		ruleset: ['Terastal Clause', 'Dynamax Clause', 'Obtainable', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: '[Gen 8 Clover CAP Only] Free-For-All Random Battle',
		mod: 'clovercap',
		team: 'random',
		gameType: 'freeforall',
		tournamentShow: false,
		rated: false,
		ruleset: ['Terastal Clause', 'Dynamax Clause', 'Obtainable', 'Species Clause', 'HP Percentage Mod', 'Cancel Mod', 'Sleep Clause Mod'],
	},
	{
		name: '[Gen 8 Cope Only] Anything Goes',
		mod: 'cope',
		ruleset: [
			'Terastal Clause',
			'Obtainable',
			'Dynamax Clause',
			'Team Preview',
			'Endless Battle Clause',
			'HP Percentage Mod',
			'Cancel Mod',
			'Sketch Post-Gen 7 Moves',
		],
	},
	{
		name: '[Gen 8 Cope Only] Ubers',
		mod: 'cope',
		ruleset: [
			'Terastal Clause',
			'Obtainable',
			'Dynamax Clause',
			'Sleep Clause Mod',
			'Team Preview',
			'Endless Battle Clause',
			'HP Percentage Mod',
			'Cancel Mod',
			'Sketch Post-Gen 7 Moves',
			'OHKO Clause',
			'Evasion Moves Clause',
			'Species Clause',
		],
		banlist: [
			'AG',
			'Baton Pass',
			'Moody',
			'Arena Trap',
			'Shadow Tag',
			'Doomsday',
			'Doomsday-Revenant',
			'Worldle',
			'Eternal Walk',
			'Cope',
			'Fuck You'],
		unbanlist: ['THROBAK + Wonder Guard'],
	},
	{
		name: '[Gen 8 Cope Only] OU',
		mod: 'cope',
		ruleset: [
			'Terastal Clause',
			'Obtainable',
			'Dynamax Clause',
			'Sleep Clause Mod',
			'Team Preview',
			'Endless Battle Clause',
			'HP Percentage Mod',
			'Cancel Mod',
			'Sketch Post-Gen 7 Moves',
			'OHKO Clause',
			'Evasion Moves Clause',
			'Species Clause',
		],
		banlist: [
			'AG',
			'Uber',
			'Baton Pass',
			'Moody',
			'Arena Trap',
			'Shadow Tag',
			'Doomsday',
			'Doomsday-Revenant',
			'Worldle',
			'Eternal Walk',
			'Fuck You',
			'Drizzle',
			'Drought',
			'Krackocean',
			'Aurora Veil',
			'Maximize',
			"Cope + King's Rock"],
		unbanlist: ['THROBAK + Wonder Guard'],
	},

	{
		name: '[Gen 8 Cope Only] Flipped',
		mod: 'cope',
		rated: false,
		ruleset: [
			'Terastal Clause',
			'Obtainable',
			'Dynamax Clause',
			'Sleep Clause Mod',
			'Team Preview',
			'Endless Battle Clause',
			'HP Percentage Mod',
			'Cancel Mod',
			'Sketch Post-Gen 7 Moves',
			'OHKO Clause',
			'Evasion Moves Clause',
			'Species Clause',
			'Flipped Mod',
		],
		banlist: ['AG', 'Uber', 'Baton Pass', 'Moody', 'Arena Trap', 'Shadow Tag', 'Doomsday', 'Doomsday-Revenant', 'Worldle', 'Eternal Walk', 'Cope', 'Fuck You', 'Wicked Blow', 'Krackocean'],
		unbanlist: ['THROBAK + Wonder Guard'],
	},
	///////////////////////////////////////////////////////////////////
	// Create-a-Blobbos (CAB)
	///////////////////////////////////////////////////////////////////
	{
		section: 'Create-a-Blobbos (CAB)',
		column: 3,
	},
	{
		name: '[Gen 8 Clover Blobbos CAP Only] OU',
		mod: 'cloverblobboscap',
		ruleset: [
			'Terastal Clause',
			'Obtainable',
			'Team Preview',
			'Sleep Clause Mod',
			'Blobbos Only',
			'Endless Battle Clause',
			'HP Percentage Mod',
			'Cancel Mod',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
			'OHKO Clause',
			'Evasion Moves Clause',
		],
		banlist: ['Uber', 'Baton Pass', 'Moody', 'Arena Trap', 'Shadow Tag', 'Fling + License to Sell Hotdogs', 'Mitosis Mash', 'Wrap + Perish Touch', 'Bind + Perish Touch', 'Cell Construct', 'Power Herb + Geomancy', 'Power Herb + Awaken', 'Ultimate Flex', 'Star Rod + Victory Dance', "Partner's Pendant + Super Snore"],
	},
	{
		name: '[Gen 8 Clover Blobbos CAP Only] Ubers',
		mod: 'cloverblobboscap',
		ruleset: [
			'Terastal Clause',
			'Obtainable',
			'Team Preview',
			'Sleep Clause Mod',
			'Blobbos Only',
			'Endless Battle Clause',
			'HP Percentage Mod',
			'Cancel Mod',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
			'OHKO Clause',
			'Evasion Moves Clause',
		],
		banlist: ['Fling + License to Sell Hotdogs', 'Wheygle + Unburden', 'Condoom + Unaware'],
	},
	{
		name: '[Gen 8 Clover Blobbos CAP Only] Doubles OU',
		gameType: 'doubles',
		mod: 'cloverblobboscap',
		ruleset: [
			'Terastal Clause',
			'Obtainable',
			'Team Preview',
			'Sleep Clause Mod',
			'Blobbos Only',
			'Endless Battle Clause',
			'HP Percentage Mod',
			'Cancel Mod',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
			'OHKO Clause',
			'Evasion Moves Clause',
		],
		banlist: ['Uber', 'Baton Pass', 'Moody', 'Arena Trap', 'Shadow Tag', 'Blobbos-Plok + Jet Punch', 'Fling + License to Sell Hotdogs', 'Mitosis Mash', 'Cell Construct'],
	},
	{
		name: '[Gen 8 Clover Blobbos CAP Only] Draft OU',
		mod: 'cloverblobboscap',
		ruleset: [
			'Terastal Clause',
			'Obtainable',
			'Team Preview',
			'Sleep Clause Mod',
			'Blobbos Only',
			'Endless Battle Clause',
			'HP Percentage Mod',
			'Cancel Mod',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
			'OHKO Clause',
			'Evasion Moves Clause',
		],
		banlist: ['Baton Pass', 'Uber', 'Blobbos-Attack', 'Moody', 'Soul Crusher', 'Rage Fist', 'Revival Blessing', 'Shed Tail', 'Loaded Disk', 'Banana', 'Glomp :3', 'Nimble Metal Body', 'Arena Trap', 'Shadow Tag', 'Fling + License to Sell Hotdogs', 'Mitosis Mash', 'Cell Construct', 'Power Herb + Geomancy', 'Last Respects + Blobbos-Paldea', 'Sketch + Blobbos-Doodle', 'Huge Power + Blobbos-Chad', 'Pure Power + Blobbos-Chad', 'Power Herb + Awaken', 'Zeroite', 'Star Rod + Victory Dance', 'A Blobbos', 'Blobbos-Adventurer', 'Blobbos-Extradimensional', 'Immortality', 'Blobbos-Gay', 'Infection', 'Blobbos-Arceus', 'Blobbos-Clover', 'Blobbos-Dark Matter', 'Blobbos-Zero', 'Blobbos-Forbidden', 'Blobbos-Horse', 'Blobbos-Lich', 'Blobbos-Primal', "Partner's Pendant + Super Snore"],
		unbanlist: ['Blobbos-King'],
	},
	{
		name: '[Gen 8 Clover Blobbos CAP Only] Random Battle',
		mod: 'cloverblobboscap',
		team: 'random',
		ruleset: ['Terastal Clause', 'Dynamax Clause', 'Obtainable', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: '[Gen 8 Clover Blobbos CAP Only] Pick Your Team Random Battle',
		mod: 'cloverblobboscap',
		team: 'random',
		ruleset: [
			'Terastal Clause',
			'Picked Team Size = 6',
			'Max Team Size = 12',
			'Team Preview',
			'Dynamax Clause',
			'Obtainable',
			'HP Percentage Mod',
			'Cancel Mod',
		],
	},
	{
		name: '[Gen 8 Clover Blobbos CAP Only] FFA Random Battle',
		mod: 'cloverblobboscap',
		gameType: 'freeforall',
		team: 'random',
		tournamentShow: false,
		rated: false,
		ruleset: ['Terastal Clause', 'Dynamax Clause', 'Obtainable', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: '[Gen 8 Clover Blobbos CAP Only] Pokebilities',
		mod: 'cloverblobboscap',
		rated: false,
		ruleset: [
			'Terastal Clause',
			'Obtainable',
			'Team Preview',
			'Sleep Clause Mod',
			'Blobbos Only',
			'Endless Battle Clause',
			'HP Percentage Mod',
			'Cancel Mod',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
			'OHKO Clause',
			'Evasion Moves Clause',
		],
		banlist: [
			'Uber', 'Baton Pass',
			'Shadow Tag', 'Arena Trap', 'Moody',
			'Blobbos-Chad', 'Cell Construct', 'Stink Bomb',
			'Blobbos-Bunny', 'Neutralizing Gas', 'Blobbos-Nega',
			'Ascension', 'Mitosis Mash', 'Blobbos-Plok + Jet Punch', 'Fling + License to Sell Hotdogs',
			'Power Herb + Geomancy', 'Power Herb + Awaken', 'Baitite + Destiny Bond', 'Star Rod + Victory Dance',
		],
		onBegin() {
			for (const pokemon of this.getAllPokemon()) {
				const ruleTable = this.dex.formats.getRuleTable(this.format);

				pokemon.m.innates = Object.keys(pokemon.species.abilities)
					.map(key => this.toID(pokemon.species.abilities[key as "0" | "1" | "H" | "S"]))
					.filter(ability => !ruleTable.isBanned(`ability:${ability}`))
					.filter(ability => ability !== pokemon.ability);
			}
		},
		onSwitchInPriority: 2,
		onSwitchIn(pokemon) {
			if (pokemon.m.innates) {
				for (const innate of pokemon.m.innates) {
					pokemon.addVolatile("ability:" + innate, pokemon);
				}
			}
		},
		onAfterMega(pokemon) {
			for (const innate of Object.keys(pokemon.volatiles).filter(i => i.startsWith('ability:'))) {
				pokemon.removeVolatile(innate);
			}
			pokemon.m.innates = undefined;
		},
	},

	{
		name: '[Gen 8 Clover Blobbos CAP Only] Pokebilities FFA Random Battle',
		mod: 'cloverblobboscap',
		gameType: 'freeforall',
		team: 'random',
		tournamentShow: false,
		rated: false,
		ruleset: ['Terastal Clause', 'Dynamax Clause', 'Obtainable', 'HP Percentage Mod', 'Cancel Mod'],
		onBegin() {
			for (const pokemon of this.getAllPokemon()) {
				const ruleTable = this.dex.formats.getRuleTable(this.format);

				pokemon.m.innates = Object.keys(pokemon.species.abilities)
					.map(key => this.toID(pokemon.species.abilities[key as "0" | "1" | "H" | "S"]))
					.filter(ability => !ruleTable.isBanned(`ability:${ability}`))
					.filter(ability => ability !== pokemon.ability);
			}
		},
		onSwitchInPriority: 2,
		onSwitchIn(pokemon) {
			if (pokemon.m.innates) {
				for (const innate of pokemon.m.innates) {
					pokemon.addVolatile("ability:" + innate, pokemon);
				}
			}
		},
		onAfterMega(pokemon) {
			for (const innate of Object.keys(pokemon.volatiles).filter(i => i.startsWith('ability:'))) {
				pokemon.removeVolatile(innate);
			}
			pokemon.m.innates = undefined;
		},
	},

	///////////////////////////////////////////////////////////////////
	// Showderp
	///////////////////////////////////////////////////////////////////
	{
		section: 'Showderp',
		column: 3,
	},
	{
		name: '[Gen 9] Random Showderp Meme Battle',
		mod: 'gen9',
		team: 'randomMeme',
		rated: false,
		ruleset: ['Terastal Clause', 'Dynamax Clause', 'HP Percentage Mod', 'Cancel Mod', 'Sleep Clause Mod'],
	},
	{
		name: '[Gen 9] Random Showderp Meme Battle Doubles',
		mod: 'gen9',
		gameType: 'doubles',
		team: 'randomMeme',
		rated: false,
		ruleset: ['Terastal Clause', 'Dynamax Clause', 'HP Percentage Mod', 'Cancel Mod', 'Sleep Clause Mod'],
	},
	{
		name: '[Gen 9] Free-For-All Random Showderp Meme Battle',
		mod: 'gen9',
		gameType: 'freeforall',
		tournamentShow: false,
		team: 'randomMeme',
		rated: false,
		ruleset: ['Terastal Clause', 'Dynamax Clause', 'HP Percentage Mod', 'Cancel Mod', 'Sleep Clause Mod'],
	},
	///////////////////////////////////////////////////////////////////
	// Other Nonsense
	///////////////////////////////////////////////////////////////////
	{
		section: 'Other Nonsense',
		column: 3,
	},
	{
		name: '[Gen 8 Sandbox Only] OU',
		mod: 'sandbox',
		ruleset: [
			'Terastal Clause',
			'Obtainable',
			'Team Preview',
			'Sleep Clause Mod',
			'Endless Battle Clause',
			'HP Percentage Mod',
			'Cancel Mod',
			'Sketch Post-Gen 7 Moves',
			'OHKO Clause',
			'Evasion Moves Clause',
			'Species Clause but Special for Blobbos',
		],
		banlist: ['Baton Pass', 'Nothing', 'Moody', 'Arena Trap', 'Shadow Tag', 'Doomsday', 'Glass Cat', 'Doomsday-Revenant', 'Fusjite', 'Eternatus-Eternamax', 'Fuck You', 'Eternal Walk', 'Cope', 'Francine', "It's Over", "F Bomb", "Pokestar-Spirit", "Kingmadio", "Zacian", "Zacian-Crowned", "Calyrex-Shadow", 'Fling + License to Sell Hotdogs', 'Skull Cannon', 'Extinction Wave', 'Wonder Guard', 'Junkbane', 'Shed Tail'],
	},
	{
		name: '[Gen 8 Sandbox Only] FFA Battle',
		mod: 'sandbox',
		gameType: 'freeforall',
		searchShow: false,
		rated: false,
		ruleset: [
			'Obtainable',
			'Team Preview',
			'Endless Battle Clause',
			'HP Percentage Mod',
			'Cancel Mod',
			'Sketch Post-Gen 7 Moves',
		],
		banlist: ['Nothing', 'Doomsday', 'Doomsday-Revenant', 'Fusjite', 'Eternatus-Eternamax', 'Fuck You', 'Eternal Walk', 'Cope', 'Francine', "It's Over", "F Bomb", "Pokestar-Spirit", "Kingmadio", 'Fling + License to Sell Hotdogs'],
	},
	{
		name: '[Gen 8 Sandbox Only] Regulated OU',
		mod: 'sandbox',
		ruleset: [
			'Terastal Clause',
			'Obtainable',
			'Team Preview',
			'Sleep Clause Mod',
			'Endless Battle Clause',
			'HP Percentage Mod',
			'Cancel Mod',
			'Sketch Post-Gen 7 Moves',
			'OHKO Clause',
			'Evasion Moves Clause',
			'Species Clause but Special for Blobbos',
		],
		banlist: ['Baton Pass', 'Nothing', 'Moody', 'Arena Trap', 'Shadow Tag', 'Doomsday', 'Doomsday-Revenant', 'Fusjite', 'Eternatus-Eternamax', 'Fuck You', 'Eternal Walk', 'Cope', 'Francine', "It's Over", "F Bomb", "Pokestar-Spirit", "Kingmadio", "Zacian", "Zacian-Crowned", "Calyrex-Shadow", 'Fling + License to Sell Hotdogs', 'Skull Cannon', 'Extinction Wave', 'Wonder Guard', 'Junkbane', 'Shed Tail',
			'Condoom + Unaware',
			'Adesign', 'Demiwaifu', 'Notridley', 'Endranther', 'Baddon', 'Scytill', 'Foryu', 'Clovenix', 'Jewipede', 'Chromox', 'Heliofug', 'Vivaiger',
			'Fontaba-/z/', 'Arceus', 'Kuuroba', 'Funnedong', 'Narwhiz', 'Niterpent', 'Griffawork', 'Boarnograf', 'Tentaquil', 'Regishort', 'Regicide', 'Devante', 'Manatank',
			'Nyanonite', 'The Forest', 'Vergilion', 'Dragapult', 'Annihilape', 'Calyrex-Ice', 'Chien-Pao', 'Dialga', 'Espathra', 'Eternatus', 'Flutter Mane', 'Giratina', 'Giratina-Origin',
			'Groudon', 'Iron Bundle', 'Landorus', 'Koraidon', 'Kyogre', 'Magearna', 'Mewtwo', 'Miraidon', 'Palafin', 'Palafin-Hero', 'Palkia', 'Palkia-Origin', 'Rayquaza', 'Regieleki',
			'Urshifu', 'Urshifu-Rapid-Strike', 'Volcarona', 'Zamazenta', 'Zamazenta-Crowned', 'Cinderace', 'Darmanitan-Galar', 'Darmanitan-Galar-Zen',
			'Dracovish', 'Genesect', 'Kyurem', 'Kyurem-Black', 'Kyurem-White', 'Lugia', 'Lunala', 'Marshadow', 'Naganadel', 'Necrozma-Dusk Mane', 'Necrozma-Dawn Wings', 'Pheromosa', 'Solgaleo',
			'Spectrier', 'Xerneas', 'Yveltal', 'Zygarde', 'Zygarde-Complete', 'Deoxys', 'Deoxys-Attack', 'Deoxys-Defense', 'Deoxys-Speed', 'Gengarite', 'Groudon-Primal', 'Kangaskhanite', 'Kyogre-Primal',
			'Lucarionite', 'Metagrossite', 'Necrozma-Ultra', 'Ultranecrozium Z', 'Salamencite', 'Sablenite', 'Regigigas + Big Guy', 'Blobbos-Forbidden', 'Fatherfuck', 'Hofucyea', 'Blobbos-Cell + Regenerator',
			'Blobbos-Clover', 'Oblivion', 'Infected-Zombie', 'Blobbos-Wack', 'Blobbos-Wack-Mega', 'Dussans', 'Ho-Oh', 'Jewipede-O', 'Fucker-Ultra', 'Regigigone +  Flame Body', 'Beegyosh', 'Dugwalker',
			'Taterdoom', 'Lemonhorse', 'Neohorse', 'Piiviasuustro', 'Purplegoat', 'Blobbos-Homestuck-God-Tier', 'Blobbos-Dark Matter', 'Blobbos-eedle', 'Blobbos-eedle-True', 'Blobbos-King',
			'Blobbos-Zero', 'Oengas', 'Aurumoth', 'Galashitwatt', 'Sableven', 'Zangursed', 'Abdiking', 'Smellsumo', 'Autumn', 'Shroomageddon', 'Junkgeist', 'Sableedle', 'Spireedle', 'Cell Construct',
		],

	},

	{
		name: '[Gen 8 Sandbox Only] Multi-Battle',
		mod: 'sandbox',
		ruleset: [
			'Terastal Clause',
			'Obtainable',
			'Team Preview',
			'Sleep Clause Mod',
			'Endless Battle Clause',
			'HP Percentage Mod',
			'Cancel Mod',
			'Sketch Post-Gen 7 Moves',
			'OHKO Clause',
			'Evasion Moves Clause',
			'Species Clause but Special for Blobbos',
		],
		tournamentShow: false,
		rated: false,
		searchShow: false,
		gameType: 'multi',
		banlist: ['Baton Pass', 'Nothing', 'Moody', 'Arena Trap', 'Shadow Tag', 'Doomsday', 'Doomsday-Revenant', 'Fusjite', 'Eternatus-Eternamax', 'Fuck You', 'Eternal Walk', 'Cope', 'Francine', "It's Over", "F Bomb", "Pokestar-Spirit", "Kingmadio", "Zacian", "Zacian-Crowned", "Calyrex-Shadow", 'Fling + License to Sell Hotdogs', 'Skull Cannon', 'Extinction Wave', 'Wonder Guard', 'Junkbane', 'Shed Tail'],
	},

	{
		name: '[Gen 8 Sburbmons Only] OU',
		mod: 'sburbmons',
		ruleset: [
			'Terastal Clause',
			'Standard',
			'! Nickname Clause',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
		],
		banlist: [
			'Uber', 'Arena Trap', 'Moody', 'Power Construct', 'Shadow Tag', 'Baton Pass',
		],
	},
	{
		name: '[Gen 8 Sweet Only] OU',
		mod: 'sweet',
		ruleset: [
			'Terastal Clause',
			'Standard',
			'! Nickname Clause',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
		],
		banlist: [
			'Uber', 'Arena Trap', 'Moody', 'Power Construct', 'Shadow Tag', 'Baton Pass',
		],
	},
	{
		name: '[Gen 8 WIPMons Only] OU',
		mod: 'wipmons',
		ruleset: [
			'Terastal Clause',
			'Standard',
			'! Nickname Clause',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
		],
		banlist: [
			'Uber', 'Arena Trap', 'Smellox + Stink Bomb', 'Chasumo + Fuk U', 'Moody', 'Power Construct', 'Shadow Tag', 'Baton Pass', 'Wonder Guard',
			'Condoom + Unaware',
		],
	},
	{
		name: '[Gen 8 WIPMons Only] Ubers',
		mod: 'wipmons',
		ruleset: [
			'Terastal Clause',
			'Standard',
			'! Nickname Clause',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
		],
		banlist: [
			'Baton Pass',
		],
	},
	{
		name: '[Gen 8 Cope CAP CAB Draft Only] S1',
		mod: 'copecapcabdraft',
		ruleset: [
			'Terastal Clause',
			'Standard',
			'! Nickname Clause',
			'Dynamax Clause',
			'Sketch Post-Gen 7 Moves',
			'Baton Pass Mod',
		],
		banlist: [
			'AG',
			'Uber',
			'Moody',
			'Arena Trap',
			'Shadow Tag',
			'Doomsday',
			'Doomsday-Revenant',
			'Worldle',
			'Eternal Walk',
			'Fuck You',
			'Krackocean',
			'Pixilate + Extreme Speed',
			'Raidenetti + Speed Boost',
			'Stingulor + Toke',
			'Rendalopod + Fishious Rend',
			'Rendalopod + Bolt Beak',
			'Dall-eedle + Dire Claw',
			'Alberfect Cell + Dragon Dance',
			'Alberfect Cell + Strength Sap',
			'Fling + License to Sell Hotdogs',
			'Soul Crusher',
		   'Revival Blessing',
			'Last Respects',
			'Rollan',
			'Shed Tail',
			'Trick Stab + Illusion',
			'Sly Squall + Illusion',
			'Star Rod + Victory Dance',
			'Banana',
			'Glomp :3',
			'Nimble Metal Body',
			'Mitosis Mash',
			'Cell Construct',
			'Power Herb + Geomancy',
			'Sketch + Blobbos-Doodle',
			'Huge Power + Blobbos-Chad',
			'Pure Power + Blobbos-Chad',
			'Power Herb + Awaken',
			'Blobbos-Tandor',
			'Catalyst',
			'Transfusion',
			'More Room',
			'Hidden Power',
			'Cocken + Ancient Power',
			'Fuk U',
			'Stink Bomb',
			'Toothpaste',
			'Whetstone',
			'Efficient Pick',
			'Lamp of Fortunes',
			'Sterilizing Ampoule',
			'Baton Pass + Ingrain',
			'Baton Pass + Aqua Ring',
			'Baton Pass + Substitute',
		],
		unbanlist: [
			'THROBAK + Wonder Guard', 'Blobbos-King', 'Alberfect Cell', 'Manatank', 'Chromox', 'Walkie Talkie'],
	},
	{
		name: "[Gen 1] Ubers",
		mod: 'gen1',
		searchShow: false,
		rated: false,
		ruleset: ['Terastal Clause', 'Standard', '! Nickname Clause'],
	},
	{
		name: "[Gen 1] OU",
		mod: 'gen1',
		searchShow: false,
		rated: false,
		ruleset: ['Terastal Clause', 'Standard', '! Nickname Clause'],
		banlist: ['Uber'],
	},
	{
		name: "[Gen 1] UU",
		mod: 'gen1',
		searchShow: false,
		rated: false,
		ruleset: ['Terastal Clause', '[Gen 1] OU', 'APT Clause'],
		banlist: ['OU', 'UUBL'],
	},
	{
		name: "[Gen 1] 10u",
		mod: "gen1",
		ruleset: ['Standard', '! Nickname Clause'],
		banlist: ["AG", "Uber", "OU", "UUBL", "UU", "RUBL", "RU", "NUBL", "NU", "PUBL", "PU", "NFE", "DUber", "DOU", "DBL", "DUU", "LC"],
		unbanlist: ['Weedle', 'Kakuna', 'Caterpie', 'Metapod', 'Ditto', 'Magikarp', 'Magikarp + Dragon Rage'],
	},
	{
		name: "[Gen 1] 10u (No Teambuilder)",
		mod: "gen1",
		ruleset: ['Standard'],
		team: 'random10u',
	},
];
