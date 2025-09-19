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
  drillpeck: {
    inherit: true,
    desc: "Has a higher chance for a critical hit.",
    shortDesc: "High critical hit ratio."
  },
  dragonclaw: {
    inherit: true,
    desc: "Has a higher chance for a critical hit.",
    shortDesc: "High critical hit ratio."
  },
  electricterrain: {
    inherit: true,
    desc: "For 5 turns, the terrain becomes Electric Terrain. During the effect, the power of Electric-type attacks made by grounded Pokemon is multiplied by 1.5 and grounded Pokemon cannot fall asleep; Pokemon already asleep do not wake up. Grounded Pokemon cannot become affected by Yawn or fall asleep from its effect. Camouflage transforms the user into an Electric type, Nature Power becomes Thunderbolt, and Secret Power has a 30% chance to cause paralysis. Fails if the current terrain is Electric Terrain."
  },
  grassyterrain: {
    inherit: true,
    desc: "For 5 turns, the terrain becomes Grassy Terrain. During the effect, the power of Grass-type attacks used by grounded Pokemon is multiplied by 1.5, the power of Bulldoze, Earthquake, and Magnitude used against grounded Pokemon is multiplied by 0.5, and grounded Pokemon have 1/16 of their maximum HP, rounded down, restored at the end of each turn, including the last turn. Camouflage transforms the user into a Grass type, Nature Power becomes Energy Ball, and Secret Power has a 30% chance to cause sleep. Fails if the current terrain is Grassy Terrain."
  },
  hail: {
    inherit: true,
    desc: "For 5 turns, the weather becomes Hail. At the end of each turn except the last, all active Pokemon lose 1/16 of their maximum HP, rounded down, unless they are an Ice type or have the Ice Body, Magic Guard, Overcoat, or Snow Cloak Abilities. During the effect, the Defense of Ice-type Pokemon is multiplied by 1.5 when taking damage from a physical attack. Lasts for 8 turns if the user is holding Icy Rock. Fails if the current weather is Hail.",
    shortDesc: "For 5 turns, hail crashes down. Ice: 1.5x Def."
  },
  psychicterrain: {
    inherit: true,
    desc: "For 5 turns, the terrain becomes Psychic Terrain. During the effect, the power of Psychic-type attacks made by grounded Pokemon is multiplied by 1.5 and grounded Pokemon cannot be hit by moves with priority greater than 0, unless the target is an ally. Camouflage transforms the user into a Psychic type, Nature Power becomes Psychic, and Secret Power has a 30% chance to lower the target's Speed by 1 stage. Fails if the current terrain is Psychic Terrain."
  },
  shelltrap: {
    inherit: true,
    desc: "Doubles in power if hit by a physical move before moving.",
    shortDesc: "Doubles in power if hit by a physical move before moving."
  },
  wildcharge: {
    inherit: true,
    desc: "If the target lost HP, the user takes recoil damage equal to 1/4 the HP lost by the target, rounded half up, but not less than 1 HP. Has a 20% chance to paralyze the target.",
    shortDesc: "Has 1/4 recoil. 20% chance to paralyze the target."
  },
  xscissor: {
    inherit: true,
    desc: "Has a higher chance for a critical hit.",
    shortDesc: "High critical hit ratio."
  }
};
//# sourceMappingURL=moves.js.map
