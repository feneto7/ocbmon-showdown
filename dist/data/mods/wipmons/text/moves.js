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
  grassyterrain: {
    name: "Grassy Terrain",
    desc: "For 5 turns, the terrain becomes Grassy Terrain. During the effect, the power of Grass-type attacks used by grounded Pokemon is multiplied by 1.3, the power of Bulldoze, Earthquake, Earth Power and Magnitude used against grounded Pokemon is multiplied by 0.5, and grounded Pokemon have 1/16 of their maximum HP, rounded down, restored at the end of each turn, including the last turn. Camouflage transforms the user into a Grass type, Nature Power becomes Energy Ball, and Secret Power has a 30% chance to cause sleep. Fails if the current terrain is Grassy Terrain.",
    shortDesc: "5 turns. Ground: +Grass power, +1/16 max HP."
  },
  xscissor: {
    inherit: true,
    desc: "Has a higher chance for a critical hit.",
    shortDesc: "High critical hit ratio."
  },
  smellingsalts: {
    inherit: true,
    desc: "Power doubles if the target is paralyzed. If the user has not fainted, the target is cured of paralysis. Has a 10% chance of paralyzing the opponent on hit.",
    shortDesc: "Power doubles if target is paralyzed, and cures it. 10% chance to paralyze."
  },
  razorwind: {
    inherit: true,
    desc: "Guaranteed to land a critical hit.",
    shortDesc: "Always crits."
  },
  skyuppercut: {
    inherit: true,
    desc: "This move is neutrally effective on Flying-type Pokemon. This move can hit Pokemon that are using Bounce, Fly, or Sky Drop.",
    shortDesc: "Neutral on Flying. Can hit Pokemon using Bounce, Fly, or Sky Drop."
  },
  chargebeam: {
    inherit: true,
    desc: "Has a 100% chance to raise the user's Special Attack by 1 stage.",
    shortDesc: "100% chance to raise the user's Sp. Atk by 1."
  },
  sleazyspores: {
    inherit: true,
    shortDesc: "Lowers Speed of foes by 1 on switch-in. Grass-type Pokemon remove it on switch-in.",
    desc: "Sets up a hazard on the opposing side of the field, lowering the Speed by 1 stage of each opposing Pokemon that switches in, unless it is immune to powder moves. Fails if the effect is already active on the opposing side. Can be removed from the opposing side if any opposing Pokemon uses Rapid Spin or Defog successfully, is hit by Defog. Grass-type Pokemon, upon switching in, will remove the hazard."
  }
};
//# sourceMappingURL=moves.js.map
