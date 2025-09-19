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
var items_exports = {};
__export(items_exports, {
  ItemsText: () => ItemsText
});
module.exports = __toCommonJS(items_exports);
const ItemsText = {
  luckypunch: {
    inherit: true,
    desc: "If held by a Chansey or Fucker, its critical hit ratio is raised by 2 stages.",
    shortDesc: "If held by a Chansey or Fucker, its critical hit ratio is raised by 2 stages.",
    gen2: {
      desc: "If held by a Chansey or Fucker, its critical hit ratio is always at stage 2. (25% crit rate)",
      shortDesc: "If held by a Chansey or Fucker, its critical hit ratio is always at stage 2. (25% crit rate)"
    }
  }
};
//# sourceMappingURL=items.js.map
