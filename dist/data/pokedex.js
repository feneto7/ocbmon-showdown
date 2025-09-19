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
var pokedex_exports = {};
__export(pokedex_exports, {
  Pokedex: () => Pokedex
});
module.exports = __toCommonJS(pokedex_exports);
const Pokedex = {
  //aqui começa os pokemons wack//
  //os pokemons ocb serao cadastrados por cima deles//
  woot: {
    num: 666e3,
    name: "Woot",
    types: ["Wood"],
    baseStats: { hp: 38, atk: 47, def: 62, spa: 24, spd: 42, spe: 64 },
    abilities: { 0: "Overgrow", 1: "Battle Armor", H: "Speed Boost" },
    heightm: 1,
    weightkg: 30.4,
    color: "Green",
    evos: ["Woodie"],
    eggGroups: ["Monster", "Grass"]
  },
  woodie: {
    num: 666001,
    name: "Woodie",
    types: ["Wood", "Flying"],
    baseStats: { hp: 64, atk: 85, def: 90, spa: 30, spd: 63, spe: 73 },
    abilities: { 0: "Battle Armor", H: "Speed Boost" },
    heightm: 1,
    weightkg: 13,
    color: "Green",
    prevo: "Woot",
    evos: ["Arbrood"],
    eggGroups: ["Monster", "Grass"]
  },
  arbrood: {
    num: 666002,
    name: "Arbrood",
    types: ["Wood", "Flying"],
    baseStats: { hp: 80, atk: 110, def: 120, spa: 60, spd: 85, spe: 75 },
    abilities: { 0: "Battle Armor", H: "Speed Boost" },
    heightm: 1,
    weightkg: 13,
    color: "Green",
    prevo: "Woodie",
    evos: ["Marbrood"],
    eggGroups: ["Monster", "Grass"]
  },
  maggie: {
    num: 666003,
    name: "Maggie",
    types: ["Magma"],
    baseStats: { hp: 39, atk: 40, def: 60, spa: 65, spd: 52, spe: 50 },
    abilities: { 0: "Magma Armor", H: "Flame Body" },
    heightm: 0.6,
    weightkg: 8.5,
    color: "Red",
    evos: ["Magman"],
    eggGroups: ["Amorphous", "Mineral"]
  }
};
//# sourceMappingURL=pokedex.js.map
