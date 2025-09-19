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
  batonpassmod: {
    effectType: "Rule",
    name: "Baton Pass Mod",
    desc: "Positive stat boosts are reset upon using Baton Pass.",
    onBegin() {
      this.add("rule", "Baton Pass Mod: Positive stat boosts are reset upon using Baton Pass");
    },
    onHit(source, target, move) {
      if (source.positiveBoosts() && move.id === "batonpass") {
        this.add("-clearpositiveboost", source);
        this.hint("Baton Pass Mod activated: Stat Boosts cannot be passed");
      }
    }
  },
  hoenngaidenmod: {
    effectType: "Rule",
    name: "Hoenn Gaiden Mod",
    desc: "At the start of a battle, gives each player a link to the Hoenn Gaiden thread so they can use it to get information about new additions to the metagame.",
    onBegin() {
      this.add(`raw|<img src="https://cdn.discordapp.com/attachments/510822010922860545/864665757446045716/Hoenn_Gaiden_Banner.png" height="213" width="381">`);
      this.add("-message", `Welcome to Hoenn Gaiden!`);
      this.add("-message", `This is a [Gen 3] OU-based format where we add later generation Pokemon, items, moves, and abilities, as well as change up existing ones!`);
      this.add("-message", `You can find our thread and metagame resources here:`);
      this.add("-message", `https://www.smogon.com/forums/threads/hoenn-gaiden-pet-mod-of-the-season-slate-8-concept-voting.3681339/`);
    }
  },
  hgstandard: {
    effectType: "ValidatorRule",
    name: "HG Standard",
    desc: "The standard ruleset for all Hoenn Gaiden tiers.",
    ruleset: [
      "Obtainable",
      "Sleep Clause Mod",
      "Switch Priority Clause Mod",
      "Species Clause",
      "Nickname Clause",
      "OHKO Clause",
      "Moody Clause",
      "Evasion Moves Clause",
      "Endless Battle Clause",
      "HP Percentage Mod",
      "Cancel Mod",
      "Hoenn Gaiden Mod",
      "Deoxys Camouflage Clause",
      "Baton Pass Mod"
    ],
    banlist: [
      "Armaldo + Rapid Spin + Knock Off",
      "Kabutops + Rapid Spin + Knock Off",
      "Skarmory + Whirlwind + Drill Peck",
      "Weavile + Calm Mind"
    ]
  }
};
//# sourceMappingURL=rulesets.js.map
