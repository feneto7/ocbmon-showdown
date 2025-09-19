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
var transfer_exports = {};
__export(transfer_exports, {
  commands: () => commands
});
module.exports = __toCommonJS(transfer_exports);
var import_lib = require("../../lib");
var import_badges = require("./badges");
var import_ladders_local = require("../ladders-local");
var import_data_badges = require("./data-badges");
const TRANSFER_COOLDOWN = 7 * 24 * 60 * 60 * 1e3;
const transfers = JSON.parse(
  (0, import_lib.FS)("config/chat-plugins/transfer.json").readIfExistsSync() || "{}"
);
const saveTransfers = () => {
  (0, import_lib.FS)("config/chat-plugins/transfer.json").writeUpdate(() => JSON.stringify(transfers));
};
const checkCooldown = (userId) => Object.values(transfers).filter((transfer) => {
  if (transfer.sourceId !== userId && transfer.targetId !== userId)
    return false;
  if (!transfer.isComplete)
    return false;
  if (transfer.completed && transfer.completed + TRANSFER_COOLDOWN < Date.now())
    return false;
  return true;
});
const userInBattle = (user) => {
  const curBattles = [...user.inRooms].filter((id) => {
    const battle = Rooms.get(id)?.battle;
    return battle && battle.playerTable[user.id];
  }).map((id) => [user, id]);
  return curBattles.length !== 0;
};
const commands = {
  transfer: {
    start(target, room, user) {
      if (transfers[user.id])
        throw new Chat.ErrorMessage("You have already started a transfer. Please use /transfer cancel to cancel it first.");
      const targetId = toID(target);
      if (target.length < 0) {
        throw new Chat.ErrorMessage("Please provide a valid user to transfer to.");
      }
      if (targetId === user.id)
        throw new Chat.ErrorMessage("You cannot transfer to yourself.");
      if (checkCooldown(user.id))
        throw new Chat.ErrorMessage("You have already transferred to another user in the last week. Please wait 7 days between transfers.");
      if (checkCooldown(targetId))
        throw new Chat.ErrorMessage("Target user has already transferred to another user in the last week. Please wait 7 days between transfers.");
      transfers[user.id] = {
        sourceId: user.id,
        targetId,
        isComplete: false
      };
      saveTransfers();
      return this.sendReplyBox(`Transfer to ${targetId} successfully initiated.`);
    },
    cancel(target, room, user) {
      if (!transfers[user.id])
        throw new Chat.ErrorMessage("You have not started a transfer.");
      delete transfers[user.id];
      saveTransfers();
      return this.sendReplyBox("Transfer successfully canceled.");
    },
    async accept(target, room, user) {
      const targetId = toID(target);
      const transfer = transfers[targetId];
      if (!transfer || transfer.targetId !== user.id)
        throw new Chat.ErrorMessage(`No transfer has been initiated between you and ${targetId}.`);
      if (transfer.isComplete)
        throw new Chat.ErrorMessage("Transfer has already been completed.");
      if (userInBattle(user))
        throw new Chat.ErrorMessage("You cannot accept a transfer while in a battle.");
      if (checkCooldown(user.id))
        throw new Chat.ErrorMessage("You have already transferred to another user in the last week. Please wait 7 days between transfers.");
      if (checkCooldown(targetId))
        throw new Chat.ErrorMessage("Target user has already transferred to another user in the last week. Please wait 7 days between transfers.");
      const sourceId = transfer.sourceId;
      const updatedRows = await import_ladders_local.LadderStore.changeName(sourceId, user.name);
      const allBadges = await import_badges.Badges.getUserBadges(sourceId);
      if (allBadges.length) {
        for (const badge of allBadges) {
          await import_badges.Badges.removeBadgeFromUser(sourceId, badge.badge_id, user, true);
          await import_badges.Badges.addBadgeToUser(user.id, badge.badge_id, user, true);
          if (badge.badge_data) {
            await import_badges.Badges.updateBadgeData(user.id, badge.badge_id, badge.badge_data, user, true);
          }
        }
      }
      await (0, import_data_badges.transferTourWins)(targetId, user.id, user);
      transfers[targetId].isComplete = true;
      transfers[targetId].completed = Date.now();
      saveTransfers();
      return this.sendReplyBox(`Successfuly transfered ladder data and badges. Raw data: ${JSON.stringify({ rating: updatedRows, badges: allBadges })}`);
    }
  },
  transferhelp() {
    this.sendReplyBox(
      `<code>/transfer start [new user]</code>: Begins a transfer of user data from your current user to a desired target user. Use this command on your old user.<br /><code>/transfer cancel</code>: Cancels an in-progress transfer started from your current user.<br /><code>/transfer accept [old user]</code>: Accepts a transfer from another user to your current user. Use this command on your new user.`
    );
  }
};
//# sourceMappingURL=transfer.js.map
