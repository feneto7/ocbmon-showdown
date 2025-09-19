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
var moves_exports = {};
__export(moves_exports, {
  MovesText: () => MovesText
});
module.exports = __toCommonJS(moves_exports);
const MovesText = {
  blastburn: {
    inherit: true,
    desc: "If the target lost HP, the user takes recoil damage equal to 33% the HP lost by the target, rounded half up, but not less than 1 HP.",
    shortDesc: "Has 50% recoil."
  },
  hydrocannon: {
    inherit: true,
    desc: "If the target lost HP, the user takes recoil damage equal to 33% the HP lost by the target, rounded half up, but not less than 1 HP.",
    shortDesc: "Has 50% recoil."
  },
  frenzyplant: {
    inherit: true,
    desc: "If the target lost HP, the user takes recoil damage equal to 33% the HP lost by the target, rounded half up, but not less than 1 HP.",
    shortDesc: "Has 50% recoil."
  },
  boil: {
    name: "BOIL",
    desc: "Boils the target. 100% burn, high crit ratio.",
    shortDesc: "Boils the target. 100% burn, high crit ratio."
  },
  bind: {
    name: "Bind",
    desc: "100% chance to make the target flinch.",
    shortDesc: "100% chance to make the target flinch."
  },
  rockwrecker: {
    name: "Rock Wrecker",
    desc: "Lowers the user's Attack and Defense by 1 stage.",
    shortDesc: "Lowers the user's Attack and Defense by 1."
  }
};
//# sourceMappingURL=moves.js.map
