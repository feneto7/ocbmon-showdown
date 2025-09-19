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
var conditions_exports = {};
__export(conditions_exports, {
  Conditions: () => Conditions
});
module.exports = __toCommonJS(conditions_exports);
const Conditions = {
  raindance: {
    inherit: true,
    onWeatherModifyDamage(damage, attacker, defender, move) {
      if (defender.hasItem("utilityumbrella"))
        return;
      if (move.type === "Vanilla") {
        this.debug("rain vanilla boost");
        return this.chainModify(1.5);
      }
      if (move.type === "Chocolate") {
        this.debug("rain chocolate suppress");
        return this.chainModify(0.5);
      }
    }
  },
  sunnyday: {
    inherit: true,
    onWeatherModifyDamage(damage, attacker, defender, move) {
      if (move.id === "hydrosteam" && !attacker.hasItem("utilityumbrella")) {
        this.debug("Sunny Day Hydro Steam boost");
        return this.chainModify(1.5);
      }
      if (defender.hasItem("utilityumbrella"))
        return;
      if (move.type === "Chocolate") {
        this.debug("Sunny Day chocolate boost");
        return this.chainModify(1.5);
      }
      if (move.type === "Vanilla") {
        this.debug("Sunny Day vanilla suppress");
        return this.chainModify(0.5);
      }
    }
  },
  sandstorm: {
    inherit: true,
    onModifySpD() {
    }
  }
};
//# sourceMappingURL=conditions.js.map
