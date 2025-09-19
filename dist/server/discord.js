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
var discord_exports = {};
__export(discord_exports, {
  DiscordClient: () => DiscordClient
});
module.exports = __toCommonJS(discord_exports);
var import_discord = __toESM(require("discord.js"));
class DiscordClient {
  getToken() {
    return Config.discordtoken || "";
  }
  async initializeClient() {
    const discordClient = new import_discord.default.Client({ intents: [] });
    return new Promise((resolve, reject) => {
      discordClient.on(import_discord.Events.ClientReady, resolve);
      discordClient.login(this.getToken()).catch(() => reject());
      setTimeout(() => reject(), 5e3);
    });
  }
  async getClient() {
    if (this.discordClient && this.discordClient.isReady()) {
      return this.discordClient;
    }
    return this.initializeClient();
  }
}
//# sourceMappingURL=discord.js.map
