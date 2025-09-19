"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var formats_exports = {};
__export(formats_exports, {
  Formats: () => Formats
});
module.exports = __toCommonJS(formats_exports);
const Formats = [
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
    section: "Wack OMs",
    column: 2
  },
  {
    name: "[Gen 8 Wack Only] FFA Battle",
    mod: "wack",
    gameType: "freeforall",
    searchShow: false,
    rated: false,
    ruleset: [
      "Terastal Clause",
      "Standard",
      "! Nickname Clause",
      "Dynamax Clause",
      "Swagger Clause",
      "Overflow Stat Mod",
      "Sketch Post-Gen 7 Moves"
    ],
    banlist: [
      "DUber",
      "Uber",
      "Arena Trap",
      "Moody",
      "Sand Veil",
      "Snow Cloak",
      "Computer Bug",
      "Baton Pass",
      "Gods Endurance",
      "Shadow Tag",
      "Wonder Guard",
      "Wacky",
      "Abyssal Hell Drag",
      "Twindeath",
      "Desecrations",
      "Extreme Evoboost",
      "Cryaa",
      "aaryC",
      "Drizzle",
      "Drought",
      "Snow Warning",
      "Sand Stream",
      "Shadow Call",
      "Acid Cloudburst",
      "Thunderstorm",
      "Corrupt Orb",
      "Border Wall",
      "Ultra Cloak",
      "Ultra Scarf",
      "Pitch Sludge",
      "Apex Orb",
      "Antiplebshield",
      "GODSORB",
      "Sans Hoodie",
      "Ginsio Berry",
      "Uranus Orb",
      "Ballet Outfit",
      "Frost Orb",
      "Nap Orb",
      "Ethereal",
      "Glass Armor",
      "Fangclaw",
      "Craggy Helmet",
      "Bootsofblindingspeed + Bestow",
      "Bootsofblindingspeed + Trick",
      "Bootsofblindingspeed + Switcheroo",
      "Inverted Rune",
      "Sheriff Hat",
      "Hell Drag",
      "Pacify",
      "Rift Strike",
      "Perfect Freeze",
      "Time Stasis"
    ]
  },
  {
    name: "[Gen 8 Wack Only] Multi Battle",
    mod: "wack",
    gameType: "multi",
    searchShow: false,
    rated: false,
    ruleset: [
      "Terastal Clause",
      "Standard",
      "! Nickname Clause",
      "Dynamax Clause",
      "Swagger Clause",
      "Overflow Stat Mod",
      "Sketch Post-Gen 7 Moves"
    ],
    banlist: [
      "DUber",
      "Uber",
      "Arena Trap",
      "Moody",
      "Sand Veil",
      "Snow Cloak",
      "Computer Bug",
      "Baton Pass",
      "Gods Endurance",
      "Shadow Tag",
      "Wonder Guard",
      "Wacky",
      "Abyssal Hell Drag",
      "Twindeath",
      "Desecrations",
      "Extreme Evoboost",
      "Cryaa",
      "aaryC",
      "Drizzle",
      "Drought",
      "Snow Warning",
      "Sand Stream",
      "Shadow Call",
      "Acid Cloudburst",
      "Thunderstorm",
      "Corrupt Orb",
      "Border Wall",
      "Ultra Cloak",
      "Ultra Scarf",
      "Pitch Sludge",
      "Apex Orb",
      "Antiplebshield",
      "GODSORB",
      "Sans Hoodie",
      "Ginsio Berry",
      "Uranus Orb",
      "Ballet Outfit",
      "Frost Orb",
      "Nap Orb",
      "Ethereal",
      "Glass Armor",
      "Fangclaw",
      "Craggy Helmet",
      "Bootsofblindingspeed + Bestow",
      "Bootsofblindingspeed + Trick",
      "Bootsofblindingspeed + Switcheroo",
      "Inverted Rune",
      "Sheriff Hat",
      "Hell Drag",
      "Pacify",
      "Rift Strike",
      "Perfect Freeze",
      "Time Stasis"
    ]
  },
  {
    name: "[Gen 8 Wack Only] Custom Game",
    mod: "wack",
    searchShow: false,
    rated: false,
    debug: true,
    battle: { trunc: Math.trunc },
    ruleset: ["Terastal Clause", "Team Preview", "Cancel Mod", "Max Team Size = 24", "Max Move Count = 24", "Max Level = 9999", "Default Level = 100", "Overflow Stat Mod"]
  },
  {
    name: "[Gen 8 Wack Only] Custom Game (Doubles)",
    mod: "wack",
    gameType: "doubles",
    searchShow: false,
    rated: false,
    debug: true,
    battle: { trunc: Math.trunc },
    ruleset: ["Terastal Clause", "Team Preview", "Cancel Mod", "Max Team Size = 24", "Max Move Count = 24", "Max Level = 9999", "Default Level = 100", "Overflow Stat Mod"]
  },
  ///////////////////////////////////////////////////////////////////
  // Gen 9
  ///////////////////////////////////////////////////////////////////
  {
    section: "Gen 9",
    column: 2
  },
  {
    name: "[Gen 9] Random Battle",
    mod: "gen9predlc",
    team: "random",
    ruleset: ["Terastal Clause", "HP Percentage Mod", "Cancel Mod"]
  },
  {
    name: "[Gen 9] Free-For-All Random Battle",
    mod: "gen9predlc",
    gameType: "freeforall",
    tournamentShow: false,
    team: "random",
    rated: false,
    ruleset: ["Terastal Clause", "Species Clause", "HP Percentage Mod", "Cancel Mod", "Sleep Clause Mod"]
  }
];
//# sourceMappingURL=formats.js.map
