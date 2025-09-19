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
var rulesets_exports = {};
__export(rulesets_exports, {
  Rulesets: () => Rulesets
});
module.exports = __toCommonJS(rulesets_exports);
const Rulesets = {
  standard: {
    inherit: true,
    ruleset: [
      "Obtainable",
      "Team Preview",
      "Sleep Clause Mod",
      "Species Clause",
      "Nickname Clause",
      "OHKO Clause",
      "Evasion Moves Clause",
      "Endless Battle Clause",
      "HP Percentage Mod",
      "Cancel Mod"
    ]
  },
  standarddoubles: {
    inherit: true,
    ruleset: [
      "Obtainable",
      "Team Preview",
      "Species Clause",
      "Nickname Clause",
      "OHKO Clause",
      "Evasion Moves Clause",
      "Gravity Sleep Clause",
      "Endless Battle Clause",
      "HP Percentage Mod",
      "Cancel Mod"
    ]
  },
  standardoms: {
    inherit: true,
    ruleset: [
      "Obtainable",
      "Team Preview",
      "Species Clause",
      "Nickname Clause",
      "OHKO Clause",
      "Evasion Moves Clause",
      "Endless Battle Clause",
      "Dynamax Clause",
      "HP Percentage Mod",
      "Cancel Mod",
      "Overflow Stat Mod"
    ]
  },
  teampreview: {
    inherit: true,
    onTeamPreview() {
      this.add("clearpoke");
      for (const pokemon of this.getAllPokemon()) {
        const details = pokemon.details.replace(", shiny", "").replace(/(Arceus|Greninja|Gourgeist|Pumpkaboo|Xerneas|Silvally|Urshifu|Dudunsparce)(-[a-zA-Z?-]+)?/g, "$1-*").replace(/(Zacian|Zamazenta)(?!-Crowned)/g, "$1-*");
        this.add("poke", pokemon.side.id, details, "");
      }
      this.makeRequest("teampreview");
    }
  },
  tiershiftmod: {
    inherit: true,
    desc: `Pok&eacute;mon below OU get their stats, excluding HP, boosted. UU/RUBL get +10, RU/NUBL get +20, NU/PUBL get +30, and PU or lower get +40.`,
    onModifySpecies(species, target, source, effect) {
      if (!species.baseStats)
        return;
      const boosts = {
        uu: 10,
        rubl: 10,
        ru: 20,
        nubl: 20,
        nu: 30,
        publ: 30,
        pu: 40,
        nfe: 40,
        lc: 40
      };
      let tier = this.toID(species.tier);
      if (!(tier in boosts))
        return;
      if (target) {
        if (target.set.item === "lightclay")
          return;
        if (["drizzle", "drought", "slushrush"].includes(target.set.ability) && boosts[tier] > 20)
          tier = "nubl";
      }
      const pokemon = this.dex.deepClone(species);
      pokemon.bst = pokemon.baseStats["hp"];
      const boost = boosts[tier];
      let statName;
      for (statName in pokemon.baseStats) {
        if (statName === "hp")
          continue;
        pokemon.baseStats[statName] = this.clampIntRange(pokemon.baseStats[statName] + boost, 1, 255);
        pokemon.bst += pokemon.baseStats[statName];
      }
      return pokemon;
    }
  },
  bonustypemod: {
    inherit: true,
    desc: `Pok&eacute;mon can be nicknamed the name of a type to have that type added onto their current ones.`,
    onBegin() {
      this.add("rule", "Bonus Type Mod: Pok\xE9mon can be nicknamed the name of a type to have that type added onto their current ones.");
    },
    onModifySpecies(species, target, source, effect) {
      if (!target)
        return;
      if (effect && ["imposter", "transform"].includes(effect.id))
        return;
      const typesSet = new Set(species.types);
      const bonusType = this.dex.types.get(target.set.name);
      if (bonusType.exists)
        typesSet.add(bonusType.name);
      return { ...species, types: [...typesSet] };
    }
  }
};
//# sourceMappingURL=rulesets.js.map
