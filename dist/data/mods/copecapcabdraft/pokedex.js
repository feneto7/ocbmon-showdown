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
  ribbizap: {
    inherit: true,
    evos: ["Bulbfrog"]
  },
  bulbfrog: {
    inherit: true,
    prevo: "Ribbizap",
    evoType: "useItem",
    evoItem: "Thunder Stone"
  },
  anaconduke: {
    inherit: true,
    evos: ["Ballboa"]
  },
  ballboa: {
    inherit: true,
    prevo: "Anaconduke",
    evoLevel: 50
  },
  honrade: {
    inherit: true,
    evos: ["Devante", "Vergilion"]
  },
  devante: {
    inherit: true,
    prevo: "Honrade",
    evoType: "useItem",
    evoItem: "Sun Stone"
  },
  vergilion: {
    inherit: true,
    prevo: "Honrade",
    evoType: "useItem",
    evoItem: "Moon Stone"
  },
  kuuroba: {
    num: 69233,
    name: "Kuuroba",
    types: [
      "Grass",
      "Fighting"
    ],
    genderRatio: {
      M: 0.25,
      F: 0.75
    },
    baseStats: {
      hp: 90,
      atk: 105,
      def: 90,
      spa: 80,
      spd: 90,
      spe: 75
    },
    abilities: { 0: "Super Luck", H: "Super Luck", S: "Super Luck" },
    heightm: 1.9,
    weightkg: 102,
    color: "Green",
    prevo: "Clovour",
    evoLevel: 60,
    eggGroups: [
      "Fairy",
      "Grass"
    ],
    gen: 8
  },
  pantherk: {
    inherit: true,
    baseStats: {
      hp: 85,
      atk: 115,
      def: 75,
      spa: 105,
      spd: 75,
      spe: 75
    }
  },
  sparmor: {
    num: -42015,
    name: "Sparmor",
    types: [
      "Electric"
    ],
    genderRatio: {
      M: 0.5,
      F: 0.5
    },
    baseStats: {
      hp: 45,
      atk: 60,
      def: 80,
      spa: 40,
      spd: 55,
      spe: 40
    },
    abilities: {
      0: "Static",
      1: "Shell Armor",
      H: "Lightning Rod",
      S: "Teravolt"
    },
    heightm: 0.4,
    weightkg: 10.2,
    color: "Yellow",
    evos: [
      "Ohmadillo"
    ],
    eggGroups: [
      "Field",
      "Monster"
    ],
    gen: 8,
    creator: "Spectralized"
  },
  ohmadillo: {
    num: -42016,
    name: "Ohmadillo",
    types: ["Electric", "Fighting"],
    genderRatio: {
      M: 0.5,
      F: 0.5
    },
    baseStats: {
      hp: 65,
      atk: 85,
      def: 100,
      spa: 50,
      spd: 75,
      spe: 55
    },
    abilities: {
      0: "Static",
      1: "Shell Armor",
      H: "Guts",
      S: "Teravolt"
    },
    heightm: 1.1,
    weightkg: 30,
    color: "Yellow",
    prevo: "Sparmor",
    evoLevel: 25,
    evos: [
      "Colombolt"
    ],
    eggGroups: [
      "Field",
      "Monster"
    ],
    gen: 8,
    creator: "Spectralized"
  },
  genine: {
    num: -42125,
    name: "Genine",
    types: ["Dark", "Ground"],
    gender: "N",
    baseStats: { hp: 90, atk: 100, def: 100, spa: 83, spd: 86, spe: 89 },
    abilities: { 0: "Supreme Underlord", 1: "Bulletproof", H: "Quark Drive", S: "Good as Zinc" },
    heightm: 6.3,
    weightkg: 666.6,
    color: "Black",
    eggGroups: ["Smoggonpleasebankingambitsexual"],
    gen: 8,
    creator: "Mr. Sableye"
  }
};
//# sourceMappingURL=pokedex.js.map
