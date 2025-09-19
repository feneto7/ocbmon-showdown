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
var abilities_exports = {};
__export(abilities_exports, {
  AbilitiesText: () => AbilitiesText
});
module.exports = __toCommonJS(abilities_exports);
const AbilitiesText = {
  plus: {
    name: "Plus",
    desc: "If an active ally has this Ability or the Minus Ability, this Pokemon's Special Attack is multiplied by 1.5. After an Electric-type move hits, has a 25% chance to boost a random stat (not acc/eva).",
    shortDesc: "If an active ally has this Ability or the Minus Ability, this Pokemon's Sp. Atk is 1.5x. After an Electric-type move hits, has a 25% chance to boost a random stat (not acc/eva)."
  },
  regenerator: {
    name: "Regenerator",
    desc: "When the holder of this ability is switched out, 20% of their current max hp is recovered.",
    shortDesc: "This Pokemon restores 1/5 of its maximum HP when its switched out."
  },
  minus: {
    name: "Minus",
    desc: "If an active ally has this Ability or the Plus Ability, this Pokemon's Special Attack is multiplied by 1.5. Prevents this Pokemon's stats from being lowered.",
    shortDesc: "If an active ally has this Ability or the Plus Ability, this Pokemon's Sp. Atk is 1.5x. Prevents this Pokemon's stats from being lowered."
  }
};
//# sourceMappingURL=abilities.js.map
