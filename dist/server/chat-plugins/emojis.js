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
var emojis_exports = {};
__export(emojis_exports, {
  chatfilter: () => chatfilter,
  checkEmojiLevel: () => checkEmojiLevel,
  commands: () => commands,
  createEmojiHtml: () => createEmojiHtml,
  emojis: () => emojis
});
module.exports = __toCommonJS(emojis_exports);
var import_axios = __toESM(require("axios"));
var import_probe_image_size = __toESM(require("probe-image-size"));
var import_lib = require("../../lib");
var import_punishments = require("../punishments");
var import_utils = require("../../lib/utils");
const EMOJI_BAN_DURATION = 7 * 24 * 60 * 60 * 1e3;
const MAX_REASON_LENGTH = 300;
const MAX_EMOJI_SIZE = 64;
const EMOJI_SIZE = 32;
const ERROR_NO_EMOJI_NAME = "Specify an emoji name.";
const ERROR_NO_EMOJI_URL = "Specify an emoji URL.";
const ERROR_NO_VALID_EMOJI_IMAGE = "Specify a PNG or GIF image.";
const POKEMON_ICON_REGEX = /:mon-([a-z0-9\s]+):/gi;
const ITEM_ICON_REGEX = /:item-([a-z0-9\s]+):/gi;
const TYPE_ICON_REGEX = /:type-([a-z0-9\s]+):/gi;
const emojis = JSON.parse(
  (0, import_lib.FS)("config/chat-plugins/emojis.json").readIfExistsSync() || "{}"
);
const createEmojiRegex = (emojiNames) => new RegExp(`(${emojiNames.map((emojiName) => `:${emojiName}:`).join("|")})`, "g");
let emojiRegex = createEmojiRegex(Object.keys(emojis));
const saveEmojis = () => {
  (0, import_lib.FS)("config/chat-plugins/emojis.json").writeUpdate(() => JSON.stringify(emojis));
};
const addOrUpdateEmoji = (name, filename) => {
  emojis[name] = filename;
  emojiRegex = createEmojiRegex(Object.keys(emojis));
  saveEmojis();
};
const deleteEmoji = (name) => {
  delete emojis[name];
  emojiRegex = createEmojiRegex(Object.keys(emojis));
  saveEmojis();
};
const toAlphaNumeric = (text) => ("" + text).replace(/[^A-Za-z0-9]+/g, "");
const createEmojiHtml = (name, filename) => `<img src="https://clover.weedl.es:8443/emojis/${filename}" title=":${name}:" height="${EMOJI_SIZE}" width="${EMOJI_SIZE}">`;
const downloadEmoji = async (emojiName, imageUrl) => {
  const imagebuffer = (await import_axios.default.get(imageUrl, { responseType: "arraybuffer" })).data;
  const probeResult = import_probe_image_size.default.sync(imagebuffer);
  if (!probeResult) {
    throw new Chat.ErrorMessage(ERROR_NO_VALID_EMOJI_IMAGE);
  }
  const { width, height, type } = probeResult;
  if (!["png", "gif"].includes(type)) {
    throw new Chat.ErrorMessage(ERROR_NO_VALID_EMOJI_IMAGE);
  }
  const maxSize = Math.max(width, height);
  const minSize = Math.min(width, height);
  if (maxSize > MAX_EMOJI_SIZE || minSize < EMOJI_SIZE || width !== height) {
    throw new Chat.ErrorMessage(`Specify a square image between 32x32 and 64x64. Your image is ${probeResult.width}x${probeResult.height}`);
  }
  const fileName = `${emojiName}.${type}`;
  await (0, import_lib.FS)(`./config/emojis/${fileName}`).write(imagebuffer);
  return fileName;
};
const commands = {
  emojis: "emoji",
  emoji: {
    list() {
      this.runBroadcast();
      return this.sendReplyBox(`<b><u>Emojis</u> <i>(hover for name, try <code>:EMOJINAME:</code>)</i></b><br />${Object.entries(emojis).map(([emojiName, emojiUrl]) => createEmojiHtml(emojiName, emojiUrl)).join(" ")}`);
    },
    update: "add",
    async add(target, room, user) {
      this.checkCan("emoji");
      const [rawEmojiName, emojiUrl] = target.split(",").map((part) => part.trim());
      if (!rawEmojiName) {
        return this.errorReply(ERROR_NO_EMOJI_NAME);
      }
      const emojiName = toAlphaNumeric(rawEmojiName);
      if (!emojiUrl) {
        return this.errorReply(ERROR_NO_EMOJI_URL);
      }
      const filename = await downloadEmoji(emojiName, emojiUrl);
      addOrUpdateEmoji(emojiName, filename);
      this.addGlobalModAction(`${user.name} added emoji :${emojiName}:`);
      return this.sendReplyBox(`Added: ${createEmojiHtml(emojiName, filename)}`);
    },
    remove(target, room, user) {
      this.checkCan("emoji");
      const emojiName = toAlphaNumeric(target);
      if (!emojis[emojiName]) {
        return this.sendReplyBox(`No such emoji :${emojiName}: exists.`);
      }
      deleteEmoji(emojiName);
      this.addGlobalModAction(`${user.name} deleted emoji :${emojiName}:`);
      return this.sendReply(`Deleted :${emojiName}:`);
    },
    async ban(target, room, user) {
      const { targetUser, targetUsername, rest: reason } = this.splitUser(target);
      if (!targetUser)
        return this.errorReply(`User '${targetUsername}' not found.`);
      if (reason.length > MAX_REASON_LENGTH) {
        return this.errorReply(`The reason is too long. It cannot exceed ${MAX_REASON_LENGTH} characters.`);
      }
      this.checkCan("lock", targetUser);
      await import_punishments.Punishments.punish(targetUser, {
        type: "EMOJIBAN",
        expireTime: Date.now() + EMOJI_BAN_DURATION,
        id: targetUser.id,
        reason
      }, false);
      targetUser.popup(`|modal|${user.name} has emoji banned you for ${Chat.toDurationString(EMOJI_BAN_DURATION)}. ${reason}`);
      this.addGlobalModAction(`${targetUser.name} was emoji banned by ${user.name} for ${Chat.toDurationString(EMOJI_BAN_DURATION)}.${reason ? ` (${reason})` : ``}`);
      this.modlog(`EMOJI`, targetUser, reason);
    },
    unban(target, room, user) {
      const { targetUser, targetUsername } = this.splitUser(target);
      this.checkCan("lock", targetUser);
      const success = import_punishments.Punishments.unpunish(targetUser?.id || toID(targetUsername), "EMOJIBAN");
      if (success) {
        this.addGlobalModAction(`${targetUser ? targetUser.name : toID(targetUsername)}'s emoji ban was lifted by ${user.name}.`);
        this.modlog("UNEMOJIBAN", targetUser || toID(targetUsername), null, { noip: 1, noalts: 1 });
      } else {
        this.errorReply(`${targetUser ? targetUser.name : targetUsername} is not emoji banned.`);
      }
    }
  },
  emojihelp() {
    this.runBroadcast();
    return this.sendReplyBox([
      `<code>/emoji list</code> - Lists all available emojis.`,
      `<code>/emoji add [name], [image url]</code> - Adds or updates an emoji. Requires: &`,
      `<code>/emoji remove [name]</code> - Removes an emoji. Requires: &`,
      `<code>/emoji ban [user], [reason]</code> - Bans a user from using emojis. Requires: &, @, %`,
      `<code>/emoji unban [user]</code> - Removes an emoji ban from a user. Requires: &, @, %`
    ].join("<br />"));
  }
};
const checkEmojiLevel = (user, room) => {
  if (user.can("bypassall"))
    return true;
  if (room.settings.emojiLevel && !room.auth.atLeast(user, room.settings.emojiLevel))
    return false;
  return true;
};
const chatfilter = (message, user, room) => {
  if (room && !checkEmojiLevel(user, room))
    return message;
  const prefix = message.startsWith("/html") ? "" : "/html ";
  let newMessage = (0, import_utils.escapeHTML)(message);
  let anyEmoji = false;
  if (!import_punishments.Punishments.hasPunishType(user.id, "EMOJIBAN")) {
    newMessage = newMessage.replace(emojiRegex, (match) => {
      anyEmoji = true;
      const emojiName = match.slice(1, -1);
      return createEmojiHtml(emojiName, emojis[emojiName]);
    });
    newMessage = newMessage.replace(POKEMON_ICON_REGEX, (match) => {
      const monName = match.slice(5, -1);
      const mon = Dex.species.get(monName);
      if (mon.exists) {
        anyEmoji = true;
        return `<psicon pokemon="${mon.id}" />`;
      }
      return match;
    });
    newMessage = newMessage.replace(ITEM_ICON_REGEX, (match) => {
      const itemName = match.slice(6, -1);
      const item = Dex.items.get(itemName);
      if (item.exists) {
        anyEmoji = true;
        return `<psicon item="${item.id}" />`;
      }
      return match;
    });
    newMessage = newMessage.replace(TYPE_ICON_REGEX, (match) => {
      const typeName = match.slice(6, -1);
      const type = Dex.types.get(typeName);
      if (type.exists) {
        anyEmoji = true;
        return `<psicon type="${type.id}" />`;
      }
      return match;
    });
  }
  if (anyEmoji) {
    return prefix + newMessage;
  }
  return message;
};
//# sourceMappingURL=emojis.js.map
