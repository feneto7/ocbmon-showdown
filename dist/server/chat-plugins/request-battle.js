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
var request_battle_exports = {};
__export(request_battle_exports, {
  commands: () => commands
});
module.exports = __toCommonJS(request_battle_exports);
const getFormatButton = (format) => `<button name="send" value="/requestbattle ${format.id}" class="button">Request ${format.name} battle</button>`;
const commands = {
  requestbattle(target, room, user) {
    room = this.requireRoom("lobby");
    this.checkChat();
    if (!target) {
      const formats = Dex.formats.all();
      return this.sendReplyBox(formats.map(getFormatButton).join(", "));
    }
    const format = Dex.formats.get(target);
    if (!format || !format.exists) {
      throw new Chat.ErrorMessage(`${target} is not a valid format.`);
    }
    return `/html <button class="button" name="openChallenge" value="${user.id},${format.id}">Challenge me to ${format.name}</button>`;
  }
};
//# sourceMappingURL=request-battle.js.map
