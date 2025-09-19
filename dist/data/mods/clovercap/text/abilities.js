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
  },
  hypercutter: {
    inherit: true,
    shortDesc: "Prevents Attack from being lowered by foe or self."
  },
  keeneye: {
    inherit: true,
    shortDesc: "Prevents Accuracy from being lowered by foe or self. Ignores evasiveness."
  },
  transistor: {
    inherit: true,
    shortDesc: "This Pokemon's offensive stat is multiplied by 1.5 while using an Electric-type attack."
  },
  ironfist: {
    inherit: true,
    desc: "This Pokemon's punch-based attacks have 1.2x power.",
    shortDesc: "This Pokemon's punch-based attacks have 1.2x power."
  }
};
//# sourceMappingURL=abilities.js.map
