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
var tsuchinokoify_exports = {};
__export(tsuchinokoify_exports, {
  chatfilter: () => chatfilter,
  commands: () => commands,
  configs: () => configs,
  loginfilter: () => loginfilter
});
module.exports = __toCommonJS(tsuchinokoify_exports);
var import_lib = require("../../lib");
const TSUCHINOKO_AVATAR = "tsuchinoko";
const TRANSFORMATION_DURATION = 7 * 60 * 1e3;
const configs = JSON.parse(
  (0, import_lib.FS)("config/chat-plugins/tsuchinoko.json").readIfExistsSync() || "{}"
);
const saveConfig = () => {
  (0, import_lib.FS)("config/chat-plugins/tsuchinoko.json").writeUpdate(() => JSON.stringify(configs));
};
const untransform = (user) => {
  const userId = toID(user);
  const targetUser = Users.get(userId);
  if (!targetUser)
    return;
  const config = configs[targetUser.id];
  if (config) {
    targetUser.avatar = config.oldAvatar;
    delete configs[targetUser.id];
    saveConfig();
  }
};
const commands = {
  boil: "tsuchinokoify",
  tsuchinokoify(target, room, user) {
    if (!user.can("globalban", null))
      return this.errorReply("You toy with power that you do not understand.");
    const targetUser = Users.get(target);
    if (!targetUser)
      return this.errorReply("A live subject is required.");
    const now = Date.now();
    const targetUserConfig = configs[targetUser.id];
    if (targetUserConfig) {
      targetUser.avatar = targetUserConfig.oldAvatar;
      delete configs[targetUser.id];
      saveConfig();
      return this.sendReply(`The curse you have placed on ${targetUser.name} has been lifted.`);
    } else {
      setTimeout(() => {
        untransform(targetUser.id);
      }, TRANSFORMATION_DURATION);
      configs[targetUser.id] = {
        oldAvatar: targetUser.avatar,
        endTime: now + TRANSFORMATION_DURATION
      };
      targetUser.avatar = TSUCHINOKO_AVATAR;
      saveConfig();
      return this.sendReply(`You have placed a curse on ${targetUser.name}... shame on you!`);
    }
  }
};
const loginfilter = (user) => {
  const now = Date.now();
  const config = configs[user.id];
  if (config && now > config.endTime) {
    user.avatar = config.oldAvatar;
    delete configs[user.id];
    saveConfig();
  }
};
const chatfilter = (message, user) => {
  const config = configs[user.id];
  if (config && !["!", "/"].some((symbol) => message.startsWith(symbol))) {
    if (Math.random() > 0.5) {
      return message + " *squeak*";
    }
  }
  return message;
};
//# sourceMappingURL=tsuchinokoify.js.map
