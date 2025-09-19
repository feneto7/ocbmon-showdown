"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var random_teams_exports = {};
__export(random_teams_exports, {
  RandomCapTeams: () => RandomCapTeams,
  default: () => random_teams_default
});
module.exports = __toCommonJS(random_teams_exports);
var import_dex = require("../../../sim/dex");
var import_random_teams = __toESM(require("../clover/random-teams"));
class RandomCapTeams extends import_random_teams.default {
  constructor(format, prng) {
    super(format, prng);
    this.randomSets = require("./random-sets.json");
  }
  randomTeam() {
    const seed = this.prng.seed;
    const ruleTable = this.dex.formats.getRuleTable(this.format);
    const pokemon = [];
    const isMonotype = ruleTable.has("sametypeclause");
    const typePool = Object.keys(this.dex.data.TypeChart);
    const type = this.sample(typePool);
    let potd = false;
    if (global.Config && Config.potd && ruleTable.has("potd")) {
      potd = this.dex.species.get(Config.potd);
    }
    const baseFormes = {};
    const tierCount = {};
    const typeCount = {};
    const typeComboCount = {};
    const teamDetails = {};
    const pokemonPool = this.getPokemonPool(type, pokemon, isMonotype, true);
    while (pokemonPool.length && pokemon.length < this.maxTeamSize) {
      let species = this.dex.species.get(this.sampleNoReplace(pokemonPool));
      if (!species.exists)
        continue;
      if (pokemon.length === 0 && this.noLead.includes((0, import_dex.toID)(species.name)))
        continue;
      if (!this.randomSets[(0, import_dex.toID)(species.name)])
        continue;
      if (this.format.gameType === "singles" || this.format.gameType === "freeforall" || this.format.gameType === "multi") {
        if (!species.randomBattleMoves && !this.randomSets[(0, import_dex.toID)(species.name)])
          continue;
      } else {
        if (!species.randomDoubleBattleMoves && !this.randomSets[(0, import_dex.toID)(species.name)])
          continue;
      }
      if (baseFormes[species.name])
        continue;
      switch (species.baseSpecies) {
        case "Arceus":
        case "Silvally":
          if (this.randomChance(8, 9) && !isMonotype)
            continue;
          break;
        case "Aegislash":
        case "Basculin":
        case "Gourgeist":
        case "Meloetta":
          if (this.randomChance(1, 2))
            continue;
          break;
        case "Greninja":
          if (this.gen >= 7 && this.randomChance(1, 2))
            continue;
          break;
        case "Darmanitan":
          if (species.gen === 8 && this.randomChance(1, 2))
            continue;
          break;
        case "Magearna":
        case "Toxtricity":
        case "Zacian":
        case "Zamazenta":
        case "Zarude":
        case "Appletun":
        case "Blastoise":
        case "Butterfree":
        case "Copperajah":
        case "Grimmsnarl":
        case "Inteleon":
        case "Rillaboom":
        case "Snorlax":
        case "Urshifu":
          if (this.gen >= 8 && this.randomChance(1, 2))
            continue;
          break;
      }
      if (species.name === "Zoroark" && pokemon.length > 4)
        continue;
      const tier = species.tier;
      const types = species.types;
      const typeCombo = types.slice().sort().join();
      if (!isMonotype) {
        let skip = false;
        for (const typeName of types) {
          if (typeCount[typeName] > 1) {
            skip = true;
            break;
          }
        }
        if (skip)
          continue;
      }
      if (typeComboCount[typeCombo] >= (isMonotype ? 2 : 1))
        continue;
      if (!!potd && potd.exists && pokemon.length === 1)
        species = potd;
      const set = this.randomSet(species, teamDetails, pokemon.length === 0, !["singles", "freeforall"].includes(this.format.gameType), false);
      pokemon.push(set);
      if (pokemon.length === this.maxTeamSize) {
        const illusion = teamDetails["illusion"];
        if (illusion)
          pokemon[illusion - 1].level = pokemon[5].level;
        break;
      }
      baseFormes[species.baseSpecies] = 1;
      if (tierCount[tier]) {
        tierCount[tier]++;
      } else {
        tierCount[tier] = 1;
      }
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
      if (set.ability === "Drizzle" || set.moves.includes("raindance"))
        teamDetails["rain"] = 1;
      if (set.ability === "Drought" || set.moves.includes("sunnyday"))
        teamDetails["sun"] = 1;
      if (set.ability === "Sand Stream")
        teamDetails["sand"] = 1;
      if (set.ability === "Snow Warning")
        teamDetails["hail"] = 1;
      if (set.moves.includes("spikes"))
        teamDetails["spikes"] = (teamDetails["spikes"] || 0) + 1;
      if (set.moves.includes("stealthrock"))
        teamDetails["stealthRock"] = 1;
      if (set.moves.includes("stickyweb"))
        teamDetails["stickyWeb"] = 1;
      if (set.moves.includes("toxicspikes"))
        teamDetails["toxicSpikes"] = 1;
      if (set.moves.includes("defog"))
        teamDetails["defog"] = 1;
      if (set.moves.includes("rapidspin"))
        teamDetails["rapidSpin"] = 1;
      if (set.moves.includes("auroraveil") || set.moves.includes("reflect") && set.moves.includes("lightscreen"))
        teamDetails["screens"] = 1;
      if (set.ability === "Illusion")
        teamDetails["illusion"] = pokemon.length;
    }
    if (pokemon.length < this.maxTeamSize)
      throw new Error(`Could not build a random team for ${this.format} (seed=${seed})`);
    return pokemon;
  }
}
var random_teams_default = RandomCapTeams;
//# sourceMappingURL=random-teams.js.map
