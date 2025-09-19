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
  /* Modified conditions */
  gem: {
    inherit: true,
    onBasePower(basePower, user, target, move) {
      this.debug("Gem Boost");
      return this.chainModify(1.5);
    }
  },
  hail: {
    inherit: true,
    onModifyDefPriority: 10,
    onModifyDef(def, pokemon) {
      if (pokemon.hasType("Ice") && this.field.isWeather("hail")) {
        return this.modify(def, 1.5);
      }
    }
  }
};
//# sourceMappingURL=conditions.js.map
