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
var seasonal_badges_exports = {};
__export(seasonal_badges_exports, {
  loginfilter: () => loginfilter
});
module.exports = __toCommonJS(seasonal_badges_exports);
var import_badges2 = require("./badges");
let seasonalBadges = [];
let isInitialized = false;
const initializeSeasonalBadges = async () => {
  if (isInitialized || !Config.usesqlitebadges)
    return;
  const badgesToInitialize = [
    {
      badgeId: "christmas",
      message: "Happy Holidays! Unwrap a nifty badge!",
      seasonStart: "12-25",
      seasonEnd: "12-31"
    },
    {
      badgeId: "anniversary",
      message: "Happy anniversay, Ocbmon Showdown!",
      seasonStart: "01-16",
      seasonEnd: "01-20"
    }
  ];
  const initializedSeasonalBadges = [];
  await Promise.all(badgesToInitialize.map(async (badgeToInitialize) => {
    const badge = await import_badges2.Badges.getBadge(badgeToInitialize.badgeId);
    if (badge) {
      initializedSeasonalBadges.push({
        ...badgeToInitialize,
        badge
      });
    }
  }));
  seasonalBadges = initializedSeasonalBadges;
  isInitialized = true;
};
const createDateString = (date) => {
  let month = `${date.getMonth() + 1}`;
  if (month.length < 2)
    month = "0" + month;
  let day = `${date.getDate()}`;
  if (day.length < 2)
    day = "0" + day;
  return `${month}-${day}`;
};
const isInSeason = (date, seasonalBadge) => {
  const { seasonStart, seasonEnd } = seasonalBadge;
  const dateString = createDateString(date);
  if (seasonalBadge.seasonStart.localeCompare(seasonalBadge.seasonEnd) <= 0) {
    return seasonStart.localeCompare(dateString) <= 0 && dateString.localeCompare(seasonEnd) <= 0;
  } else {
    return "01-01".localeCompare(dateString) <= 0 && dateString.localeCompare(seasonEnd) <= 0 && (dateString.localeCompare("12-31") <= 0 && seasonStart.localeCompare(dateString) <= 0);
  }
};
const loginfilter = (user) => {
  void initializeSeasonalBadges().then(() => {
    seasonalBadges.forEach((seasonalBadge) => {
      if (isInSeason(new Date(), seasonalBadge)) {
        void import_badges2.Badges.getUserBadges(user.id).then((userBadges) => {
          const hasBadge = userBadges.some((userBadge) => userBadge.badge_id === seasonalBadge.badgeId);
          if (!hasBadge) {
            void import_badges2.Badges.addBadgeToUser(user.id, seasonalBadge.badgeId, user, true).then(() => {
              user.send(`|pm|&|${user.tempGroup}${user.name}|/raw <div class="broadcast-blue"><b>${seasonalBadge.message}</b></div>`);
            });
          }
        });
      }
    });
  });
};
//# sourceMappingURL=seasonal-badges.js.map
