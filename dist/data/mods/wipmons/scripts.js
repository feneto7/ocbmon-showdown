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
var scripts_exports = {};
__export(scripts_exports, {
  Scripts: () => Scripts
});
module.exports = __toCommonJS(scripts_exports);
const Scripts = {
  inherit: "clover",
  pokemon: {
    ignoringItem() {
      const enemyUnnerving = this.foes().some((foe) => foe.hasAbility("unnerve"));
      const recoveryFoods = ["berryjuice", "leftovers"];
      return !!(this.itemState.knockedOff || this.battle.gen >= 5 && !this.isActive || !this.getItem().ignoreKlutz && this.hasAbility(["klutz", "originalsin"]) || enemyUnnerving && recoveryFoods.includes(this.item) || this.volatiles["embargo"] || this.battle.field.pseudoWeather["magicroom"]);
    }
  }
};
//# sourceMappingURL=scripts.js.map
