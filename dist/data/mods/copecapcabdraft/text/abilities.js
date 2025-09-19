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
  battlearmor: {
    inherit: true,
    desc: "This Pokemon cannot be struck by a critical hit and does not take recoil damage besides Struggle/Life Orb/crash damage.",
    shortDesc: "This Pokemon cannot be struck by a critical hit and does not take recoil damage."
  },
  shellarmor: {
    inherit: true,
    desc: "This Pokemon cannot be struck by a critical hit and does not take recoil damage besides Struggle/Life Orb/crash damage.",
    shortDesc: "This Pokemon cannot be struck by a critical hit and does not take recoil damage."
  },
  unnerve: {
    inherit: true,
    desc: "Foes cannot use Berries, Berry Juice, Leftovers, Milk Drink, Focus Munch, Soft-Boiled or Fruit Juice.",
    shortDesc: "Foes cannot use Berries, Berry Juice, Leftovers, Milk Drink, Focus Munch, Soft-Boiled or Fruit Juice."
  }
};
//# sourceMappingURL=abilities.js.map
