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
  flareboost: {
    inherit: true,
    desc: "While this Pokemon is burned, the power of its special attacks is multiplied by 1.5. No HP loss from Burn.",
    shortDesc: "While this Pokemon is burned, its special attacks have 1.5x power. No HP loss from Burn."
  },
  galewings: {
    inherit: true,
    shortDesc: "This Pokemon's Flying-type moves have their priority increased by 1.",
    desc: "This Pokemon's Flying-type moves have their priority increased by 1."
  },
  illuminate: {
    inherit: true,
    desc: "This Pokemon's moves have their accuracy multiplied by 1.3.",
    shortDesc: "This Pokemon's moves have their accuracy multiplied by 1.3."
  },
  magmaarmor: {
    inherit: true,
    shortDesc: "This Pokemon cannot be frozen and receives 1/2 damage from Water- and Ice-type moves. Gaining this Ability while frozen cures it."
  },
  runaway: {
    inherit: true,
    shortDesc: "This Pokemon is immune to trapping."
  },
  strongjaw: {
    name: "Strong Jaw",
    desc: "This Pokemon's bite-based attacks have their power multiplied by 1.5.",
    shortDesc: "This Pokemon's bite-based attacks have 1.5x power."
  },
  toxicboost: {
    inherit: true,
    desc: "While this Pokemon is poisoned, the power of its physical attacks is multiplied by 1.5. No HP loss from Poison.",
    shortDesc: "While this Pokemon is poisoned, its physical attacks have 1.5x power. No HP loss from Poison."
  },
  presage: {
    inherit: true,
    desc: "Changes weather when using certain moves relating to weather.",
    shortDesc: "Changes weather to benefit certain moves."
  },
  snowwarning: {
    inherit: true,
    shortDesc: "On switch-in, this Pokemon summons Hail."
  }
};
//# sourceMappingURL=abilities.js.map
