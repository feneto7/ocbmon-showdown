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
var usage_exports = {};
__export(usage_exports, {
  commands: () => commands,
  getStats: () => getStats
});
module.exports = __toCommonJS(usage_exports);
var import_axios = __toESM(require("axios"));
var import_avatars = require("../chat-commands/avatars");
const createAvatarHtml = (avatarName, isCustom = false) => `<img src="//${Config.routes.client}/sprites/trainers${isCustom ? "-custom" : ""}/${avatarName}.png" title="${avatarName}" alt="${avatarName}" width="80" height="80" class="pixelated" />`;
const BASE_URL = "https://usage.weedl.es";
const getStats = async (format, year, month) => {
  try {
    const path = [format, year, month].filter((value) => value !== void 0).join("/");
    const url = `${BASE_URL}/data/${path}/index.json`;
    const { data } = await import_axios.default.get(url, {
      responseType: "json"
    });
    if (typeof data === "string") {
      return void 0;
    }
    return data;
  } catch (error) {
  }
  return void 0;
};
const formatPercentage = (percentage) => Math.round((percentage * 100 + Number.EPSILON) * 100) / 100;
const resultString = (pokemon, usage, wins, totalTeams) => `<span><psicon pokemon="${pokemon}" style="vertical-align:-7px;margin:-2px" />${pokemon} (${formatPercentage(usage / totalTeams)}%, WR: ${formatPercentage(wins / usage)}%)</span>`;
const commands = {
  usage: {
    tier: "format",
    async format(target, room) {
      this.runBroadcast();
      if (!target) {
        return this.sendReplyBox(
          '<b><u>Usage Stats</u></b><br /><p>Daily usage stats for most Ocbmon Showdown formats can be found here:</p><ul><li><a href="https://usage.weedl.es">Usage Site</a></li></ul>'
        );
      }
      let [targetFormatId, targetYearText, targetMonthText] = target.split(",").map(toID);
      if (!targetFormatId) {
        const format = room?.settings.defaultFormat || room?.battle?.format;
        if (!format) {
          return this.sendReplyBox("Please specify a valid format.");
        }
        targetFormatId = toID(format);
      }
      if (targetYearText) {
        const targetYear = parseInt(targetYearText);
        if (Number.isNaN(targetYear) || targetYear > 3e3) {
          return this.sendReplyBox("Please specify a valid year.");
        }
      }
      if (targetMonthText) {
        const targetMonth = parseInt(targetMonthText);
        if (Number.isNaN(targetMonth) || targetMonth > 3e3) {
          return this.sendReplyBox("Please specify a valid month.");
        }
      }
      const stats = await getStats(targetFormatId, targetYearText, targetMonthText);
      if (!stats || !("pokemonStats" in stats)) {
        return this.sendReplyBox("No stats available.");
      }
      const allPokemonStats = Object.entries(stats.pokemonStats).sort((entryA, entryB) => {
        const [, pokemonA] = entryA;
        const [, pokemonB] = entryB;
        return pokemonB.usage - pokemonA.usage;
      }).slice(0, 10);
      const messageParts = [targetFormatId, targetYearText, targetMonthText].filter((part) => part !== void 0);
      let resultStr = `<span style="color:#999999;">Usage for ${messageParts.join(",")}:</span><br />`;
      resultStr += allPokemonStats.map(([id, pokemonStats]) => {
        const species = Dex.species.get(id);
        const name = species.name || id;
        return resultString(name, pokemonStats.usage, pokemonStats.win, stats.totalTeams);
      }).join(", ");
      return this.sendReplyBox(resultStr);
    },
    mon: "pokemon",
    async pokemon(target, room) {
      this.runBroadcast();
      let [targetPokemon, targetFormatId, targetYearText, targetMonthText] = target.split(",").map(toID);
      if (!targetPokemon) {
        return this.sendReplyBox("Please specify a Pokemon.");
      }
      if (!targetFormatId) {
        const format = room?.settings.defaultFormat || room?.battle?.format;
        if (!format) {
          return this.sendReplyBox("Please specify a valid format.");
        }
        targetFormatId = toID(format);
      }
      if (targetYearText) {
        const targetYear = parseInt(targetYearText);
        if (Number.isNaN(targetYear) || targetYear > 3e3) {
          return this.sendReplyBox("Please specify a valid year.");
        }
      }
      if (targetMonthText) {
        const targetMonth = parseInt(targetMonthText);
        if (Number.isNaN(targetMonth) || targetMonth > 3e3) {
          return this.sendReplyBox("Please specify a valid month.");
        }
      }
      const stats = await getStats(targetFormatId, targetYearText, targetMonthText);
      if (!stats || !("pokemonStats" in stats)) {
        return this.sendReplyBox("No stats available.");
      }
      const pokemonStats = stats.pokemonStats[targetPokemon];
      if (!pokemonStats) {
        return this.sendReplyBox("No stats available.");
      }
      const moves = Object.entries(pokemonStats.move).sort((entryA, entryB) => {
        const [, moveA] = entryA;
        const [, moveB] = entryB;
        return moveB.usage - moveA.usage;
      }).slice(0, 10);
      const abilities = Object.entries(pokemonStats.ability).sort((entryA, entryB) => {
        const [, abilityA] = entryA;
        const [, abilityB] = entryB;
        return abilityB.usage - abilityA.usage;
      });
      const items = Object.entries(pokemonStats.item).sort((entryA, entryB) => {
        const [, itemA] = entryA;
        const [, itemB] = entryB;
        return itemB.usage - itemA.usage;
      }).slice(0, 5);
      const pokemonName = Dex.species.get(targetPokemon)?.name || targetPokemon;
      const messageParts = [pokemonName, targetFormatId, targetYearText, targetMonthText].filter((part) => part !== void 0);
      let resultStr = `<span style="color:#999999;">Usage for ${messageParts.join(",")}:</span><br />`;
      resultStr += `<psicon pokemon="${pokemonName}" style="vertical-align:-7px;margin:-2px" />${pokemonName}<br />`;
      resultStr += `<strong>Usage</strong>: ${formatPercentage(pokemonStats.usage / stats.totalTeams)}%<br />`;
      resultStr += `<strong>Win Rate</strong>: ${formatPercentage(pokemonStats.win / pokemonStats.usage)}%`;
      const abilitiesStats = abilities.map(([abilityId, abilityStats]) => {
        const ability = Dex.abilities.get(abilityId)?.name || abilityId;
        return `${ability} (${formatPercentage(abilityStats.usage / pokemonStats.usage)}%, WR: ${formatPercentage(abilityStats.win / abilityStats.usage)}%)`;
      });
      if (abilitiesStats.length) {
        resultStr += "<br /><strong>Abilities</strong>: <br />";
        resultStr += abilitiesStats.join("<br />");
      }
      const itemsStats = items.map(([itemId, itemStats]) => {
        const item = Dex.items.get(itemId)?.name || itemId;
        return `${item} (${formatPercentage(itemStats.usage / pokemonStats.usage)}%, WR: ${formatPercentage(itemStats.win / itemStats.usage)}%)`;
      });
      if (itemsStats.length) {
        resultStr += "<br /><strong>Items</strong>: <br />";
        resultStr += itemsStats.join("<br />");
      }
      const movesStats = moves.map(([moveId, moveStats]) => {
        const move = Dex.moves.get(moveId)?.name || moveId;
        return `${move} (${formatPercentage(moveStats.usage / pokemonStats.usage)}%, WR: ${formatPercentage(moveStats.win / moveStats.usage)}%)`;
      });
      if (movesStats.length) {
        resultStr += "<br /><strong>Moves</strong>: <br />";
        resultStr += movesStats.join("<br />");
      }
      return this.sendReplyBox(resultStr);
    }
  },
  clover: {
    avatars() {
      this.runBroadcast();
      this.sendReplyBox(
        `<b><u>Avatars</u> <i>(hover for name, try <code>/avatar NAME</code>)</i></b><br />${[...import_avatars.OFFICIAL_CLODOWN_AVATARS].map((avatar) => createAvatarHtml(avatar)).join(" ")}`
      );
    },
    sprite(target) {
      this.runBroadcast();
      const targetMon = Dex.species.get(toID(target));
      if (!targetMon || !targetMon.exists) {
        throw new Chat.ErrorMessage(`No such mon: ${target}`);
      }
      let slug = toID(targetMon.baseSpecies);
      if (targetMon.forme) {
        slug += `-${toID(targetMon.forme)}`;
      }
      const sprites = [
        `https://clover.weedl.es/sprites/gen5/${slug}.png`,
        `https://clover.weedl.es/sprites/gen5-back/${slug}.png`,
        `https://clover.weedl.es/sprites/gen5-shiny/${slug}.png`,
        `https://clover.weedl.es/sprites/gen5-back-shiny/${slug}.png`
      ];
      const afdSprites = [
        `https://clover.weedl.es/sprites/afd/${slug}.png`,
        `https://clover.weedl.es/sprites/afd-back/${slug}.png`,
        `https://clover.weedl.es/sprites/afd-shiny/${slug}.png`,
        `https://clover.weedl.es/sprites/afd-back-shiny/${slug}.png`
      ];
      const afd = `<details><summary><b>AFD Sprites</b></summary>${afdSprites.map((sprite) => `<img src="${sprite}" width="96" height="96">`).join(" ")}</details>`;
      this.sendReplyBox(`<b><u>${targetMon.name} Sprites</u></b><br />` + sprites.map((sprite) => `<img src="${sprite}" width="96" height="96">`).join(" ") + afd);
    }
  }
};
//# sourceMappingURL=usage.js.map
