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
  puppeteer: {
    inherit: true,
    shortDesc: "This Pokemon's attacking stat is multiplied by 1.5 while using a Bug-type attack. Immune to Bug-type moves."
  },
  presage: {
    inherit: true,
    desc: "Changes weather when using certain moves relating to weather. Sets BP of Weather Ball to 150 in Weather, but clears weather after use.",
    shortDesc: "Changes weather to benefit certain moves. Sets BP of Weather Ball to 150 in Weather, but clears weather after use."
  }
};
//# sourceMappingURL=abilities.js.map
