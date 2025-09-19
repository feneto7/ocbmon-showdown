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
var user_data_exports = {};
__export(user_data_exports, {
  loginfilter: () => loginfilter
});
module.exports = __toCommonJS(user_data_exports);
var import_lib = require("../../lib");
var import_custom = require("./custom");
function getAvatar(name) {
  const avatarData = import_custom.avatars[toID(name)];
  if (!avatarData)
    return void 0;
  return avatarData.avatar;
}
function getTitle(name) {
  const titleData = import_custom.titles[toID(name)];
  if (!titleData)
    return void 0;
  return titleData.title;
}
async function getUserData(user) {
  return {
    id: user.id,
    name: user.name,
    group: user.tempGroup,
    badges: user.badges || [],
    customAvatar: getAvatar(user.name),
    customTitle: getTitle(user.name)
  };
}
const loginfilter = (user) => {
  getUserData(user).then((userData) => (0, import_lib.FS)(`config/users/${user.id}.json`).writeSync(JSON.stringify(userData))).catch(() => {
  });
};
//# sourceMappingURL=user-data.js.map
