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
var stickers_exports = {};
__export(stickers_exports, {
  commands: () => commands,
  createStickerHtml: () => createStickerHtml,
  downloadSticker: () => downloadSticker,
  stickers: () => stickers
});
module.exports = __toCommonJS(stickers_exports);
var import_lib = require("../../lib");
var import_punishments = require("../punishments");
var import_image = require("../../lib/image");
var import_emojis = require("./emojis");
const MAX_STICKER_SIZE = 160;
const STICKER_SIZE = 64;
const ERROR_NO_STICKER_NAME = "Specify an sticker name.";
const ERROR_NO_STICKER_URL = "Specify an sticker URL.";
const COOLDOWN = 10 * 1e3;
const stickers = JSON.parse(
  (0, import_lib.FS)("config/chat-plugins/stickers.json").readIfExistsSync() || "{}"
);
const saveStickers = () => {
  (0, import_lib.FS)("config/chat-plugins/stickers.json").writeUpdate(() => JSON.stringify(stickers));
};
const addOrUpdateSticker = (name, sticker) => {
  stickers[name] = sticker;
  saveStickers();
};
const deleteSticker = (name) => {
  delete stickers[name];
  saveStickers();
};
const cooldowns = {};
const checkCooldown = (userID) => {
  const now = Date.now();
  const activeCooldown = cooldowns[userID];
  if (activeCooldown && now - activeCooldown < COOLDOWN) {
    return false;
  }
  cooldowns[userID] = now;
  return true;
};
const toAlphaNumeric = (text) => ("" + text).replace(/[^A-Za-z0-9]+/g, "");
const createStickerHtml = (name, sticker, path = "") => `<img src="https://clover.weedl.es:8443/stickers/${path}${sticker.filename}" title="/gif ${name}" height="${sticker.height}" width="${sticker.width}">`;
const downloadSticker = async (stickerName, imageUrl, path = "./config/stickers") => {
  const result = await (0, import_image.downloadImageWithVerification)(imageUrl, {
    validTypes: ["png", "gif"],
    enforceRatio: { min: { width: 1, height: 2 }, max: { width: 2, height: 1 } },
    minDimensions: { width: STICKER_SIZE, height: STICKER_SIZE },
    maxDimensions: { width: MAX_STICKER_SIZE, height: MAX_STICKER_SIZE },
    fileSize: 1e6
  });
  if ("error" in result) {
    throw new Chat.ErrorMessage(result.error);
  }
  const fileName = `${stickerName}.${result.type}`;
  await (0, import_lib.FS)(`${path}/${fileName}`).write(result.image);
  return { filename: fileName, width: result.width, height: result.height };
};
const commands = {
  gif: "sticker",
  sticker(target, room, user) {
    if (import_punishments.Punishments.hasPunishType(user.id, "EMOJIBAN")) {
      throw new Chat.ErrorMessage("You are banned from using stickers.");
    }
    if (room && !(0, import_emojis.checkEmojiLevel)(user, room)) {
      throw new Chat.ErrorMessage("You cannot use stickers in this room.");
    }
    this.checkChat();
    const stickerName = target.trim();
    const sticker = stickers[stickerName];
    if (!sticker)
      throw new Chat.ErrorMessage(`No such sticker ${stickerName} exists.`);
    if (!checkCooldown(user.id)) {
      throw new Chat.ErrorMessage("You are using stickers too quickly.");
    }
    return `/html ${createStickerHtml(stickerName, sticker)}`;
  },
  managegif: "managesticker",
  managesticker: {
    list() {
      this.runBroadcast();
      return this.sendReplyBox(`<b><u>Stickers</u> <i>(hover for name, try <code>/gif STICKERNAME</code>)</i></b><br />${Object.entries(stickers).map(([stickerName, stickerUrl]) => createStickerHtml(stickerName, stickerUrl)).join(" ")}`);
    },
    update: "add",
    async add(target, room, user) {
      this.checkCan("emoji");
      const [rawStickerName, stickerUrl] = target.split(",").map((part) => part.trim());
      if (!rawStickerName) {
        return this.errorReply(ERROR_NO_STICKER_NAME);
      }
      const stickerName = toAlphaNumeric(rawStickerName);
      if (!stickerUrl) {
        return this.errorReply(ERROR_NO_STICKER_URL);
      }
      const sticker = await downloadSticker(stickerName, stickerUrl);
      addOrUpdateSticker(stickerName, sticker);
      this.addGlobalModAction(`${user.name} added sticker ${stickerName}`);
      return this.sendReplyBox(`Added: ${createStickerHtml(stickerName, sticker)}`);
    },
    remove(target, room, user) {
      this.checkCan("emoji");
      const stickerName = toAlphaNumeric(target);
      if (!stickers[stickerName]) {
        return this.sendReplyBox(`No such sticker ${stickerName} exists.`);
      }
      deleteSticker(stickerName);
      this.addGlobalModAction(`${user.name} deleted sticker ${stickerName}`);
      return this.sendReply(`Deleted ${stickerName}`);
    }
  },
  managestickerhelp() {
    this.runBroadcast();
    return this.sendReplyBox([
      `<code>/managesticker list</code> - Lists all available stickers.`,
      `<code>/managesticker add [name], [image url]</code> - Adds or updates an sticker. Requires: &`,
      `<code>/maangesticker remove [name]</code> - Removes an sticker. Requires: &`
    ].join("<br />"));
  }
};
//# sourceMappingURL=stickers.js.map
