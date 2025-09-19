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
var veteran_badges_exports = {};
__export(veteran_badges_exports, {
  loginfilter: () => loginfilter
});
module.exports = __toCommonJS(veteran_badges_exports);
var import_badges2 = require("./badges");
let veteranBadgeConfigurations = [
  {
    formatId: "gen8cloveronlyou",
    badgeId: "ouveteran",
    minimumElo: 1200,
    minimumBattles: 100,
    minimumWinrate: 0.4
  },
  {
    formatId: "gen8cloveronlyuu",
    badgeId: "uuveteran",
    minimumElo: 1200,
    minimumBattles: 100,
    minimumWinrate: 0.4
  },
  {
    formatId: "gen8cloveronlyru",
    badgeId: "ruveteran",
    minimumElo: 1200,
    minimumBattles: 100,
    minimumWinrate: 0.4
  },
  {
    formatId: "gen8cloveronlynu",
    badgeId: "nuveteran",
    minimumElo: 1200,
    minimumBattles: 100,
    minimumWinrate: 0.4
  },
  {
    formatId: "gen8cloveronlyubers",
    badgeId: "ubersveteran",
    minimumElo: 1200,
    minimumBattles: 100,
    minimumWinrate: 0.4
  },
  {
    formatId: "gen8cloveronlylc",
    badgeId: "lcveteran",
    minimumElo: 1200,
    minimumBattles: 100,
    minimumWinrate: 0.4
  },
  {
    formatId: "gen8clovercaponlyou",
    badgeId: "capveteran",
    minimumElo: 1200,
    minimumBattles: 100,
    minimumWinrate: 0.4
  },
  {
    formatId: "gen8cloverblobboscaponlyou",
    badgeId: "cabveteran",
    minimumElo: 1200,
    minimumBattles: 100,
    minimumWinrate: 0.4
  },
  {
    formatId: "gen8wackonlyou",
    badgeId: "wackveteran",
    minimumElo: 1200,
    minimumBattles: 100,
    minimumWinrate: 0.4
  },
  {
    formatId: "gen8sandboxonlyou",
    badgeId: "sandboxveteran",
    minimumElo: 1200,
    minimumBattles: 100,
    minimumWinrate: 0.4
  }
];
const initializeVeteranBadges = async () => {
  if (!Config.usesqlitebadges)
    return;
  veteranBadgeConfigurations = await Promise.all(veteranBadgeConfigurations.map(async (veteranBadgeConfiguration) => {
    if (veteranBadgeConfiguration.badge)
      return veteranBadgeConfiguration;
    try {
      const badge = await import_badges2.Badges.getBadge(veteranBadgeConfiguration.badgeId);
      return {
        ...veteranBadgeConfiguration,
        badge
      };
    } catch (error) {
    }
    return veteranBadgeConfiguration;
  }));
};
const loginfilter = (user) => {
  void initializeVeteranBadges().then(() => {
    veteranBadgeConfigurations.forEach(({ formatId, badgeId, minimumElo, minimumBattles, minimumWinrate, badge }) => {
      if (!badge)
        return;
      const ladder = Ladders(toID(formatId));
      void ladder.getTopData().then((rows) => {
        rows.forEach((row) => {
          const rowUserId = toID(row[2]);
          if (rowUserId !== user.id)
            return;
          const totalGames = row[3] + row[4] + row[5];
          const winrate = row[3] / totalGames;
          if (totalGames < minimumBattles)
            return;
          if (winrate < minimumWinrate)
            return;
          if (row[1] < minimumElo)
            return;
          void import_badges2.Badges.addBadgeToUser(user.id, badgeId, user, true).catch(() => {
          });
        });
      }).catch(() => {
      });
    });
  }).catch(() => {
  });
};
//# sourceMappingURL=veteran-badges.js.map
