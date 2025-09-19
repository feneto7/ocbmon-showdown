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
  Moves: () => Moves
});
module.exports = __toCommonJS(moves_exports);
const Moves = {
  attract: {
    inherit: true,
    condition: {
      noCopy: true,
      // doesn't get copied by Baton Pass
      onStart(pokemon, source, effect) {
        if (!(pokemon.gender === "M" && source.gender === "F") && !(pokemon.gender === "F" && source.gender === "M")) {
          this.debug("incompatible gender");
          return false;
        }
        if (!this.runEvent("Attract", pokemon, source)) {
          this.debug("Attract event failed");
          return false;
        }
        if (effect.id === "cutecharm" || effect.id === "ability:cutecharm") {
          this.add("-start", pokemon, "Attract", "[from] ability: Cute Charm", "[of] " + source);
        } else if (effect.id === "destinyknot") {
          this.add("-start", pokemon, "Attract", "[from] item: Destiny Knot", "[of] " + source);
        } else {
          this.add("-start", pokemon, "Attract");
        }
      },
      onUpdate(pokemon) {
        if (this.effectState.source && !this.effectState.source.isActive && pokemon.volatiles["attract"]) {
          this.debug("Removing Attract volatile on " + pokemon);
          pokemon.removeVolatile("attract");
        }
      },
      onBeforeMovePriority: 2,
      onBeforeMove(pokemon, target, move) {
        this.add("-activate", pokemon, "move: Attract", "[of] " + this.effectState.source);
        if (this.randomChance(1, 2)) {
          this.add("cant", pokemon, "Attract");
          return false;
        }
      },
      onEnd(pokemon) {
        this.add("-end", pokemon, "Attract", "[silent]");
      }
    }
  },
  gastroacid: {
    inherit: true,
    condition: {
      // Ability suppression implemented in Pokemon.ignoringAbility() within sim/pokemon.js
      onStart(pokemon) {
        this.add("-endability", pokemon);
        this.singleEvent("End", pokemon.getAbility(), pokemon.abilityState, pokemon, pokemon, "gastroacid");
        if (pokemon.m.innates) {
          for (const innate of pokemon.m.innates) {
            pokemon.removeVolatile("ability" + innate);
          }
        }
      }
    }
  },
  safeguard: {
    inherit: true,
    condition: {
      duration: 5,
      durationCallback(target, source, effect) {
        if (source?.hasAbility("persistent")) {
          this.add("-activate", source, "ability: Persistent", effect);
          return 7;
        }
        return 5;
      },
      onSetStatus(status, target, source, effect) {
        if (!effect || !source)
          return;
        if (effect.id === "yawn")
          return;
        if (effect.effectType === "Move" && effect.infiltrates && !target.isAlly(source))
          return;
        if (target !== source) {
          this.debug("interrupting setStatus");
          if (effect.id.endsWith("synchronize") || effect.effectType === "Move" && !effect.secondaries) {
            this.add("-activate", target, "move: Safeguard");
          }
          return null;
        }
      },
      onTryAddVolatile(status, target, source, effect) {
        if (!effect || !source)
          return;
        if (effect.effectType === "Move" && effect.infiltrates && !target.isAlly(source))
          return;
        if ((status.id === "confusion" || status.id === "yawn") && target !== source) {
          if (effect.effectType === "Move" && !effect.secondaries)
            this.add("-activate", target, "move: Safeguard");
          return null;
        }
      },
      onStart(side) {
        this.add("-sidestart", side, "Safeguard");
      },
      onResidualOrder: 21,
      onResidualSubOrder: 2,
      onEnd(side) {
        this.add("-sideend", side, "Safeguard");
      }
    }
  }
};
//# sourceMappingURL=moves.js.map
