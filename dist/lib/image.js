"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var image_exports = {};
__export(image_exports, {
  default: () => image_default,
  downloadImageWithVerification: () => downloadImageWithVerification
});
module.exports = __toCommonJS(image_exports);
var import_axios = __toESM(require("axios"));
var import_probe_image_size = __toESM(require("probe-image-size"));
const downloadImageWithVerification = async (imageUrl, { validTypes, enforceRatio, minDimensions, maxDimensions, fileSize }) => {
  try {
    const imageBuffer = (await import_axios.default.get(imageUrl, { responseType: "arraybuffer" })).data;
    const probeResult = import_probe_image_size.default.sync(imageBuffer);
    if (!probeResult) {
      return { error: "Invalid image." };
    }
    const { width, height, type } = probeResult;
    if (fileSize && imageBuffer.length > fileSize) {
      return { error: `Invalid image size. Found image of size ${imageBuffer.length}B, must be less than ${fileSize}B` };
    }
    if (!validTypes.includes(type)) {
      return { error: `Invalid image type. Found image of type ${type}, must be one of ${validTypes.join(",")}` };
    }
    if (enforceRatio) {
      const ratio = width / height;
      const minRatio = enforceRatio.min.width / enforceRatio.min.height;
      const maxRatio = enforceRatio.max.width / enforceRatio.max.height;
      if (ratio < minRatio || ratio > maxRatio) {
        return { error: `Invalid image size. Found image of size ${width}x${height}. Must have an aspect ratio between ${enforceRatio.min.width}:${enforceRatio.min.height} (${minRatio.toFixed(3)}) and ${enforceRatio.max.width}:${enforceRatio.max.height} (${maxRatio.toFixed(3)})` };
      }
    }
    if (minDimensions) {
      if (width < minDimensions.width || height < minDimensions.height) {
        return { error: `Invalid image size. Found image of size ${width}x${height}. Must be greater than or equal to ${minDimensions.width}x${maxDimensions?.height}` };
      }
    }
    if (maxDimensions) {
      if (width > maxDimensions.width || height > maxDimensions.height) {
        return { error: `Invalid image size. Found image of size ${width}x${height}. Must be less than or equal to ${maxDimensions.width}x${maxDimensions.height}` };
      }
    }
    return { image: imageBuffer, width, height, type };
  } catch {
    return { error: "Unknown error downloading image. " };
  }
};
var image_default = { downloadImageWithVerification };
//# sourceMappingURL=image.js.map
