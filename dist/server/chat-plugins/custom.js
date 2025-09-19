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
var custom_exports = {};
__export(custom_exports, {
  avatars: () => avatars,
  chatfilter: () => chatfilter,
  commands: () => commands,
  emojis: () => emojis,
  loginfilter: () => loginfilter,
  stickers: () => stickers,
  titles: () => titles
});
module.exports = __toCommonJS(custom_exports);
var import_parse_color = __toESM(require("parse-color"));
var import_lib = require("../../lib");
var import_data_badges = require("./data-badges");
var import_emojis = require("./emojis");
var import_stickers = require("./stickers");
var import_utils = require("../../lib/utils");
const CUSTOM_CSS_PATH = "config/custom.css";
const CSS_HEADER = `.userlist li button:hover {
	background: rgba(220,230,240,0.7);
}`;
const hasTourWins = (wins, user) => (0, import_data_badges.getTourWins)(user.id) >= wins;
const createUserCss = (userId, flair, background) => {
  const backgroundCss = [];
  if (flair) {
    backgroundCss.push(`url("${getFlairUrl(flair.pokemonId, flair.pokemonMod)}") no-repeat right -7px top ${flair.heightOffset}px`);
  }
  if (background) {
    backgroundCss.push(`rgba(${background.r},${background.g},${background.b}, 0.25)`);
  }
  if (!backgroundCss.length)
    return "";
  return `[id$="-userlist-user-${userId}"]{background: ${backgroundCss.join(", ")};}`;
};
const createUserChatCss = (userId, chatBackground) => {
  const backgroundCss = [];
  if (chatBackground) {
    backgroundCss.push(`rgba(${chatBackground.r},${chatBackground.g},${chatBackground.b}, 0.05)`);
  }
  if (!backgroundCss.length)
    return "";
  return `.chatmessage-${userId}{background: ${backgroundCss.join(", ")};}`;
};
const writeCss = (content) => (0, import_lib.FS)(CUSTOM_CSS_PATH).writeSync(content);
const updateCss = () => {
  const userConfigs = {};
  Object.entries(flairs).forEach(([userId, flair]) => {
    if (!userConfigs[userId])
      userConfigs[userId] = {};
    userConfigs[userId].flair = flair;
  });
  Object.entries(backgrounds).forEach(([userId, background]) => {
    if (!userConfigs[userId])
      userConfigs[userId] = {};
    userConfigs[userId].background = background;
  });
  Object.entries(chatBackgrounds).forEach(([userId, background]) => {
    if (!userConfigs[userId])
      userConfigs[userId] = {};
    userConfigs[userId].chatBackground = background;
  });
  writeCss([
    CSS_HEADER,
    ...Object.entries(userConfigs).map(([userId, userConfig]) => createUserCss(userId, userConfig.flair, userConfig.background)),
    ...Object.entries(userConfigs).map(([userId, userConfig]) => createUserChatCss(userId, userConfig.chatBackground))
  ].join("\n"));
};
const AVATAR_MINIMUM_TOUR_WINS = 1;
const AVATAR_USER_INELIGIBLE = "You are not eligible for a custom avatar.";
const AVATAR_ERROR_WRITING_IMAGE = "Unable to write image. Please try again or contact an administrator.";
const AVATAR_UNKNOWN_ERROR = "An unknown error occurred. Please try again or contact an administrator.";
const avatars = JSON.parse(
  (0, import_lib.FS)("config/chat-plugins/custom-avatars.json").readIfExistsSync() || "{}"
);
const saveAvatars = () => {
  (0, import_lib.FS)("config/chat-plugins/custom-avatars.json").writeUpdate(() => JSON.stringify(avatars));
};
const updateAvatarStatus = (id, statusUpdate) => {
  const avatarStatus = avatars[id];
  const newStatus = {
    enabled: false
  };
  avatars[id] = {
    ...newStatus,
    ...avatarStatus,
    ...statusUpdate
  };
  saveAvatars();
};
const createAvatarHtml = (avatarName, isCustom = false) => `<img src="//${Config.routes.client}/sprites/trainers${isCustom ? "-custom" : ""}/${avatarName}.png" title="${avatarName}" alt="${avatarName}" width="80" height="80" class="pixelated" />`;
const createRawAvatarHtml = (avatarFileName, isRequest = false) => `<avatar avatarfilename="${import_lib.Utils.escapeHTML(avatarFileName)}"${isRequest ? ' "request" ' : " "} />`;
const getUsername = (userId) => Users.get(userId)?.name || userId;
const createPendingAvatarRequestHtml = (userId, avatarFileName, isBroadcast = false) => {
  const username = getUsername(userId);
  let pendingAvatarRequestHtml = "<details>";
  pendingAvatarRequestHtml += `<summary><b>${username}${isBroadcast ? " Custom Avatar Request" : ""}</b></summary>`;
  pendingAvatarRequestHtml += createRawAvatarHtml(avatarFileName, true) + "<br />";
  pendingAvatarRequestHtml += `<button class="button" name="send" value="/custom avatar approve ${userId}">Approve</button>`;
  pendingAvatarRequestHtml += `<button class="button" name="send" value="/custom avatar deny ${userId}">Deny</button>`;
  return pendingAvatarRequestHtml + "</details>";
};
const sendPM = (message, userId) => {
  const user = Users.get(userId);
  if (user) {
    user.send(`|pm|&|${user.getIdentity()}|${message}`);
  }
};
const notifyAvatarStaff = (requesterId, fileName) => {
  const staffRoom = Rooms.get("staff");
  if (staffRoom) {
    staffRoom.sendMods(`|uhtml|avatar-request-${requesterId}|${createPendingAvatarRequestHtml(requesterId, fileName, true)}`);
  }
};
const removeAvatarStaffNotificiation = (requesterId) => {
  const staffRoom = Rooms.get("staff");
  if (staffRoom) {
    staffRoom.sendMods(
      import_lib.Utils.html`|uhtml|avatar-request-${requesterId}|`
    );
  }
};
const EMOJI_MINIMUM_TOUR_WINS = 3;
const EMOJI_USER_INELIGIBLE = `You are not eligible for a custom emoji. You must have at least ${EMOJI_MINIMUM_TOUR_WINS} tour wins.`;
const EMOJI_ERROR_WRITING_IMAGE = "Unable to write image. Please try again or contact an administrator.";
const EMOJI_UNKNOWN_ERROR = "An unknown error occurred. Please try again or contact an administrator.";
const emojis = JSON.parse(
  (0, import_lib.FS)("config/chat-plugins/custom-emojis.json").readIfExistsSync() || "{}"
);
const saveEmojis = () => {
  (0, import_lib.FS)("config/chat-plugins/custom-emojis.json").writeUpdate(() => JSON.stringify(emojis));
};
const updateEmojiStatus = (id, statusUpdate) => {
  const emojiStatus = emojis[id];
  const newStatus = {
    enabled: false
  };
  emojis[id] = {
    ...newStatus,
    ...emojiStatus,
    ...statusUpdate
  };
  saveEmojis();
};
const createRawEmojiHtml = (userId, emojiFileName, isRequest = false) => (0, import_emojis.createEmojiHtml)(
  `custom-${userId}`,
  (isRequest ? "requests/" : "") + emojiFileName
);
const createPendingEmojiRequestHtml = (userId, emojiFileName, isBroadcast = false) => {
  const username = getUsername(userId);
  let pendingEmojiRequestHtml = "<details>";
  pendingEmojiRequestHtml += `<summary><b>${username}${isBroadcast ? " Custom Emoji Request" : ""}</b></summary>`;
  pendingEmojiRequestHtml += createRawEmojiHtml(userId, emojiFileName, true) + "<br />";
  pendingEmojiRequestHtml += `<button class="button" name="send" value="/custom emoji approve ${userId}">Approve</button>`;
  pendingEmojiRequestHtml += `<button class="button" name="send" value="/custom emoji deny ${userId}">Deny</button>`;
  return pendingEmojiRequestHtml + "</details>";
};
const notifyEmojiStaff = (requesterId, fileName) => {
  const staffRoom = Rooms.get("staff");
  if (staffRoom) {
    staffRoom.sendMods(`|uhtml|emoji-request-${requesterId}|${createPendingEmojiRequestHtml(requesterId, fileName, true)}`);
  }
};
const removeEmojiStaffNotificiation = (requesterId) => {
  const staffRoom = Rooms.get("staff");
  if (staffRoom) {
    staffRoom.sendMods(
      import_lib.Utils.html`|uhtml|emoji-request-${requesterId}|`
    );
  }
};
const STICKER_MINIMUM_TOUR_WINS = 4;
const STICKER_USER_INELIGIBLE = `You are not eligible for a custom sticker. You must have at least ${STICKER_MINIMUM_TOUR_WINS} tour wins.`;
const STICKER_ERROR_WRITING_IMAGE = "Unable to write image. Please try again or contact an administrator.";
const STICKER_UNKNOWN_ERROR = "An unknown error occurred. Please try again or contact an administrator.";
const COOLDOWN = 10 * 1e3;
const stickers = JSON.parse(
  (0, import_lib.FS)("config/chat-plugins/custom-stickers.json").readIfExistsSync() || "{}"
);
const saveStickers = () => {
  (0, import_lib.FS)("config/chat-plugins/custom-stickers.json").writeUpdate(() => JSON.stringify(stickers));
};
const updateStickerStatus = (id, statusUpdate) => {
  const stickerStatus = stickers[id];
  const newStatus = {
    enabled: false
  };
  stickers[id] = {
    ...newStatus,
    ...stickerStatus,
    ...statusUpdate
  };
  saveStickers();
};
const createRawStickerHtml = (userId, sticker, isRequest = false) => (0, import_stickers.createStickerHtml)(
  `custom-${userId}`,
  sticker,
  isRequest ? "requests/" : ""
);
const createPendingStickerRequestHtml = (userId, sticker, isBroadcast = false) => {
  const username = getUsername(userId);
  let pendingStickerRequestHtml = "<details>";
  pendingStickerRequestHtml += `<summary><b>${username}${isBroadcast ? " Custom Sticker Request" : ""}</b></summary>`;
  pendingStickerRequestHtml += createRawStickerHtml(userId, sticker, true) + "<br />";
  pendingStickerRequestHtml += `<button class="button" name="send" value="/custom sticker approve ${userId}">Approve</button>`;
  pendingStickerRequestHtml += `<button class="button" name="send" value="/custom sticker deny ${userId}">Deny</button>`;
  return pendingStickerRequestHtml + "</details>";
};
const notifyStickerStaff = (requesterId, sticker) => {
  const staffRoom = Rooms.get("staff");
  if (staffRoom) {
    staffRoom.sendMods(`|uhtml|sticker-request-${requesterId}|${createPendingStickerRequestHtml(requesterId, sticker, true)}`);
  }
};
const removeStickerStaffNotificiation = (requesterId) => {
  const staffRoom = Rooms.get("staff");
  if (staffRoom) {
    staffRoom.sendMods(
      import_lib.Utils.html`|uhtml|sticker-request-${requesterId}|`
    );
  }
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
const TITLE_MINIMUM_TOUR_WINS = 2;
const TITLE_USER_INELIGIBLE = `You are not eligible for a custom title. You must have at least ${TITLE_MINIMUM_TOUR_WINS} tour wins.`;
const TITLE_USER_UNSET = "You do not have a custom title set.";
const TITLE_INVALID = "Your custom title must be between 1 and 18 characters long.";
const titles = JSON.parse(
  (0, import_lib.FS)("config/chat-plugins/custom-titles.json").readIfExistsSync() || "{}"
);
const saveTitles = () => {
  (0, import_lib.FS)("config/chat-plugins/custom-titles.json").writeUpdate(() => JSON.stringify(titles));
};
const formatTitle = (string) => string.replace(/[^A-Za-z0-9 ]*/, "").replace(/( )+/, " ");
const FLAIR_MINIMUM_TOUR_WINS = 3;
const FLAIR_USER_INELIGIBLE = `You are not eligible for a custom flair. You must have at least ${FLAIR_MINIMUM_TOUR_WINS} tour wins.`;
const FLAIR_USER_UNSET = "You do not have a custom flair set.";
const getInvalidFlairErrorMessage = (mod, name) => `Invalid flair ${mod}/${name} selected.`;
const defaultHeight = -6;
const maxHeightChange = 10;
const baseUrls = {
  pokemon: "https://raw.githubusercontent.com/Jackinev/pokeicons/master/40x30",
  clover: "https://raw.githubusercontent.com/MrSableye/ocbmon-showdown-assets/master/clover/sprites/pokemon-icons"
};
const getBaseUrl = (pokemonMod) => baseUrls[pokemonMod] || baseUrls.clover;
const getFlairUrl = (pokemonId, pokemonMod) => `${getBaseUrl(pokemonMod)}/${pokemonId}.png`;
const flairs = JSON.parse(
  (0, import_lib.FS)("config/chat-plugins/custom-flair.json").readIfExistsSync() || "{}"
);
const saveFlairs = () => {
  (0, import_lib.FS)("config/chat-plugins/custom-flair.json").writeUpdate(() => JSON.stringify(flairs));
  updateCss();
};
const NAME_COLOR_MINIMUM_TOUR_WINS = 1;
const NAME_COLOR_USER_INELIGIBLE = `You are not eligible for a custom name color. You must have at least ${NAME_COLOR_MINIMUM_TOUR_WINS} tour wins.`;
const NAME_COLOR_INVALID = "The username to use as your custom color must be at least 1 character and less than 19 characters long.";
const BACKGROUND_MINIMUM_TOUR_WINS = 5;
const BACKGROUND_USER_INELIGIBLE = `You are not eligible for a custom background. You must have at least ${BACKGROUND_MINIMUM_TOUR_WINS} tour wins.`;
const BACKGROUND_USER_UNSET = "You do not have a custom background set.";
const BACKGROUND_INVALID = "Your custom background must be a color. Try a hex value.";
const backgrounds = JSON.parse(
  (0, import_lib.FS)("config/chat-plugins/custom-background.json").readIfExistsSync() || "{}"
);
const saveBackgrounds = () => {
  (0, import_lib.FS)("config/chat-plugins/custom-background.json").writeUpdate(() => JSON.stringify(backgrounds));
  updateCss();
};
const CHAT_BACKGROUND_MINIMUM_TOUR_WINS = 6;
const CHAT_BACKGROUND_USER_INELIGIBLE = `You are not eligible for a custom chat background. You must have at least ${CHAT_BACKGROUND_MINIMUM_TOUR_WINS} tour wins.`;
const CHAT_BACKGROUND_USER_UNSET = "You do not have a custom chat background set.";
const CHAT_BACKGROUND_INVALID = "Your custom chat background must be a color. Try a hex value.";
const chatBackgrounds = JSON.parse(
  (0, import_lib.FS)("config/chat-plugins/custom-chat-background.json").readIfExistsSync() || "{}"
);
const saveChatBackgrounds = () => {
  (0, import_lib.FS)("config/chat-plugins/custom-chat-background.json").writeUpdate(() => JSON.stringify(chatBackgrounds));
  updateCss();
};
const commands = {
  cgif: "mysticker",
  csticker: "mysticker",
  mygif: "mysticker",
  mysticker(target, room, user) {
    if (Punishments.hasPunishType(user.id, "EMOJIBAN")) {
      return this.errorReply("You are banned from using stickers.");
    }
    if (room && !(0, import_emojis.checkEmojiLevel)(user, room)) {
      throw new Chat.ErrorMessage("You cannot use stickers in this room.");
    }
    this.checkChat();
    const sticker = stickers[user.id];
    if (!sticker || !sticker.sticker)
      return this.errorReply(`You have no custom sticker.`);
    if (!checkCooldown(user.id)) {
      return this.errorReply("You are using stickers too quickly.");
    }
    return `/html ${(0, import_stickers.createStickerHtml)(`custom-${user.id}`, sticker.sticker)}`;
  },
  custom: {
    avatars: "avatar",
    avatar: {
      async request(target, room, user) {
        try {
          const canHaveAvatar = Config.customavatars?.[user.id] !== void 0 || hasTourWins(AVATAR_MINIMUM_TOUR_WINS, user);
          if (!canHaveAvatar) {
            return this.errorReply(AVATAR_USER_INELIGIBLE);
          }
          const imageUrl = target.trim();
          const imageResult = await import_lib.Image.downloadImageWithVerification(imageUrl, {
            validTypes: ["png", "gif"],
            maxDimensions: { width: 80, height: 80 },
            minDimensions: { width: 80, height: 80 },
            fileSize: 2e5
          });
          if ("error" in imageResult) {
            return this.errorReply(imageResult.error);
          }
          const { image, type } = imageResult;
          try {
            const fileName = `${user.id}.${type}`;
            await (0, import_lib.FS)(`./config/avatars/requests/${fileName}`).write(image);
            updateAvatarStatus(user.id, { requestedAvatar: fileName });
            notifyAvatarStaff(user.id, fileName);
            return this.sendReplyBox(`Requested: ${createRawAvatarHtml(fileName, true)}`);
          } catch (error) {
            return this.errorReply(AVATAR_ERROR_WRITING_IMAGE);
          }
        } catch (error) {
          return this.errorReply(AVATAR_UNKNOWN_ERROR);
        }
      },
      showall: "showapproved",
      showapproved() {
        this.runBroadcast();
        this.checkCan("avatar");
        const avatarList = Object.entries(avatars).filter(([userId, avatarStatus]) => avatarStatus.avatar !== void 0);
        if (!avatarList.length) {
          return this.sendReplyBox("<b><u>Approved Avatars</u></b><br /><div>No approved avatars.</div>");
        }
        const avatarListHtml = avatarList.map(
          ([
            userId,
            avatarStatus
          ]) => `<span style="display: inline-block;"><div>${getUsername(userId)}</div><div>${createRawAvatarHtml(avatarStatus.avatar || "")}</div></span>`
        ).join(" ");
        return this.sendReplyBox("<b><u>Approved Avatars</u></b><br />" + avatarListHtml);
      },
      showrequests: "requests",
      requests() {
        this.checkCan("avatar");
        const requestList = Object.entries(avatars).filter(([userId, avatarStatus]) => avatarStatus.requestedAvatar !== void 0);
        if (!requestList.length) {
          return this.sendReplyBox(`<b><u>Avatar Requests</u></b><br /><div>No requests available.</div>`);
        }
        const requestListHtml = requestList.map(
          ([userId, avatarStatus]) => createPendingAvatarRequestHtml(userId, avatarStatus.requestedAvatar || "")
        ).join("<br />");
        return this.sendReplyBox("<b><u>Avatar Requests</u></b><br />" + requestListHtml);
      },
      approve(target) {
        this.checkCan("avatar");
        const targetId = toID(target);
        const avatarStatus = avatars[targetId];
        if (!avatarStatus || !avatarStatus.requestedAvatar) {
          return this.errorReply(`No avatar request for ${targetId}`);
        }
        updateAvatarStatus(targetId, {
          avatar: avatarStatus.requestedAvatar,
          requestedAvatar: void 0
        });
        (0, import_lib.FS)(`./config/avatars/requests/${avatarStatus.requestedAvatar}`).renameSync(`./config/avatars/${avatarStatus.requestedAvatar}`);
        sendPM(`/html <div class="infobox"><div>Avatar approved</div><div>${createRawAvatarHtml(avatarStatus.requestedAvatar)}</div></div>`, targetId);
        removeAvatarStaffNotificiation(targetId);
        return this.sendReplyBox(`<div><div>Approved avatar request of ${targetId}</div><div>${createRawAvatarHtml(avatarStatus.requestedAvatar)}</div></div>`);
      },
      deny(target) {
        this.checkCan("avatar");
        const targetId = toID(target);
        const avatarStatus = avatars[targetId];
        if (!avatarStatus || !avatarStatus.requestedAvatar) {
          return this.errorReply(`No avatar request for ${targetId}`);
        }
        updateAvatarStatus(targetId, {
          requestedAvatar: void 0
        });
        (0, import_lib.FS)(`./config/avatars/requests/${avatarStatus.requestedAvatar}`).unlinkIfExistsSync();
        sendPM("Your avatar request was denied.", targetId);
        removeAvatarStaffNotificiation(targetId);
        return this.sendReply(`Denied avatar request of ${targetId}`);
      },
      delete(target, room, user) {
        this.checkCan("avatar");
        const targetId = toID(target);
        const avatarStatus = avatars[targetId];
        if (!avatarStatus || !avatarStatus.avatar) {
          return this.errorReply(`No avatar for ${targetId}`);
        }
        updateAvatarStatus(targetId, {
          avatar: void 0
        });
        (0, import_lib.FS)(`./config/avatars/${avatarStatus.avatar}`).unlinkIfExistsSync();
        sendPM("Your avatar was deleted.", targetId);
        this.addGlobalModAction(`${user.name} deleted avatar of ${targetId}`);
        return this.sendReply(`Deleted avatar of ${targetId}`);
      },
      on(target, room, user) {
        updateAvatarStatus(user.id, { enabled: true });
        return this.sendReplyBox("Enabled custom avatar.");
      },
      off(target, room, user) {
        updateAvatarStatus(user.id, { enabled: false });
        return this.sendReplyBox("Disabled custom avatar.");
      },
      blobbos(target, room, user) {
        const isInBlobbosConfig = Config.blobbosTournamentWinners && Config.blobbosTournamentWinners.includes(user.id);
        const hasBlobbosBadge = Config.usesqlitebadges && user.badges?.some((badge) => badge.badge_id === "blobboswinner");
        if (isInBlobbosConfig || hasBlobbosBadge) {
          this.user.avatar = "#blobbos";
          this.sendReply(`${this.tr`Avatar changed to:`}
|raw|${createAvatarHtml("blobbos", true)}`);
        }
      },
      "": "help",
      help() {
        return this.parse("/help custom avatar");
      }
    },
    avatarhelp() {
      this.sendReplyBox(
        `<code>/custom avatar request [image url]</code>: requests a custom avatar. Requires: custom avatar access<br /><code>/custom avatar showall</code>: shows all approved avatars. Requires: @ or above<br /><code>/custom avatar showrequests</code>: shows all un-approved avatars. Requires: @ or above<br /><code>/custom avatar approve [user]</code>: approves the user's avatar request. Requires: @ or above<br /><code>/custom avatar deny [user]</code>: denies the user's avatar request. Requires: @ or above<br /><code>/custom avatar on</code>: enables your own custom avatar.<br /><code>/custom avatar off</code>: disables your own custom avatar.<br /><code>/custom avatar blobbos</code>: enables the covetted Blobbos avatar.<br />`
      );
    },
    emoji: {
      async request(target, room, user) {
        try {
          const canHaveEmoji = Config.customemoji?.[user.id] !== void 0 || hasTourWins(EMOJI_MINIMUM_TOUR_WINS, user);
          if (!canHaveEmoji) {
            return this.errorReply(EMOJI_USER_INELIGIBLE);
          }
          const imageUrl = target.trim();
          const imageResult = await import_lib.Image.downloadImageWithVerification(imageUrl, {
            validTypes: ["png", "gif"],
            enforceRatio: { min: { width: 1, height: 1 }, max: { width: 1, height: 1 } },
            maxDimensions: { width: 64, height: 64 },
            minDimensions: { width: 32, height: 32 },
            fileSize: 2e5
          });
          if ("error" in imageResult) {
            return this.errorReply(imageResult.error);
          }
          const { image, type } = imageResult;
          try {
            const fileName = `custom-${user.id}.${type}`;
            await (0, import_lib.FS)(`./config/emojis/requests/${fileName}`).write(image);
            updateEmojiStatus(user.id, { requestedEmoji: fileName });
            notifyEmojiStaff(user.id, fileName);
            return this.sendReplyBox(`Requested: ${createRawEmojiHtml(user.id, fileName, true)}`);
          } catch (error) {
            return this.errorReply(EMOJI_ERROR_WRITING_IMAGE);
          }
        } catch (error) {
          return this.errorReply(EMOJI_UNKNOWN_ERROR);
        }
      },
      showall: "showapproved",
      showapproved() {
        this.runBroadcast();
        this.checkCan("avatar");
        const emojiList = Object.entries(emojis).filter(([userId, emojiStatus]) => emojiStatus.emoji !== void 0);
        if (!emojiList.length) {
          return this.sendReplyBox("<b><u>Approved Emojis</u></b><br /><div>No approved emojis.</div>");
        }
        const emojiListHtml = emojiList.map(
          ([
            userId,
            emojiStatus
          ]) => `<span style="display: inline-block;"><div>${getUsername(userId)}</div><div>${createRawEmojiHtml(userId, emojiStatus.emoji || "")}</div></span>`
        ).join(" ");
        return this.sendReplyBox("<b><u>Approved Emojis</u></b><br />" + emojiListHtml);
      },
      showrequests: "requests",
      requests() {
        this.checkCan("avatar");
        const emojiList = Object.entries(emojis).filter(([userId, emojiStatus]) => emojiStatus.requestedEmoji !== void 0);
        if (!emojiList.length) {
          return this.sendReplyBox(`<b><u>Emoji Requests</u></b><br /><div>No requests available.</div>`);
        }
        const requestListHtml = emojiList.map(
          ([userId, emojiStatus]) => createPendingEmojiRequestHtml(userId, emojiStatus.requestedEmoji || "")
        ).join("<br />");
        return this.sendReplyBox("<b><u>Emoji Requests</u></b><br />" + requestListHtml);
      },
      approve(target) {
        this.checkCan("avatar");
        const targetId = toID(target);
        const emojiStatus = emojis[targetId];
        if (!emojiStatus || !emojiStatus.requestedEmoji) {
          return this.errorReply(`No emoji request for ${targetId}`);
        }
        updateEmojiStatus(targetId, {
          emoji: emojiStatus.requestedEmoji,
          requestedEmoji: void 0
        });
        (0, import_lib.FS)(`./config/emojis/requests/${emojiStatus.requestedEmoji}`).renameSync(`./config/emojis/${emojiStatus.requestedEmoji}`);
        sendPM(`/html <div class="infobox"><div>Emoji approved</div><div>${createRawEmojiHtml(targetId, emojiStatus.requestedEmoji)}</div></div>`, targetId);
        removeEmojiStaffNotificiation(targetId);
        return this.sendReplyBox(`<div><div>Approved emoji request of ${targetId}</div><div>${createRawEmojiHtml(targetId, emojiStatus.requestedEmoji)}</div></div>`);
      },
      deny(target) {
        this.checkCan("avatar");
        const targetId = toID(target);
        const emojiStatus = emojis[targetId];
        if (!emojiStatus || !emojiStatus.requestedEmoji) {
          return this.errorReply(`No emoji request for ${targetId}`);
        }
        updateEmojiStatus(targetId, {
          requestedEmoji: void 0
        });
        (0, import_lib.FS)(`./config/emojis/requests/${emojiStatus.requestedEmoji}`).unlinkIfExistsSync();
        sendPM("Your emoji request was denied.", targetId);
        removeEmojiStaffNotificiation(targetId);
        return this.sendReply(`Denied emoji request of ${targetId}`);
      },
      delete(target, room, user) {
        this.checkCan("avatar");
        const targetId = toID(target);
        const emojiStatus = emojis[targetId];
        if (!emojiStatus || !emojiStatus.emoji) {
          return this.errorReply(`No emoji for ${targetId}`);
        }
        updateEmojiStatus(targetId, {
          emoji: void 0
        });
        (0, import_lib.FS)(`./config/emojis/${emojiStatus.emoji}`).unlinkIfExistsSync();
        sendPM("Your emoji was deleted.", targetId);
        this.addGlobalModAction(`${user.name} deleted emoji of ${targetId}`);
        return this.sendReply(`Deleted emoji of ${targetId}`);
      },
      "": "help",
      help() {
        return this.parse("/help custom emoji");
      }
    },
    emojihelp() {
      this.sendReplyBox(
        `<code>/custom emoji request [image url]</code>: requests a custom emoji. Requires: custom emoji access<br /><code>/custom emoji showall</code>: shows all approved emojis. Requires: @ or above<br /><code>/custom emoji showrequests</code>: shows all un-approved emojis. Requires: @ or above<br /><code>/custom emoji approve [user]</code>: approves the user's emoji request. Requires: @ or above<br /><code>/custom emoji deny [user]</code>: denies the user's emoji request. Requires: @ or above<br />`
      );
    },
    sticker: {
      async request(target, room, user) {
        try {
          const canHaveSticker = Config.customsticker?.[user.id] !== void 0 || hasTourWins(STICKER_MINIMUM_TOUR_WINS, user);
          if (!canHaveSticker) {
            return this.errorReply(STICKER_USER_INELIGIBLE);
          }
          const imageUrl = target.trim();
          const sticker = await (0, import_stickers.downloadSticker)(`custom-${user.id}`, imageUrl, "./config/stickers/requests");
          updateStickerStatus(user.id, { requestedSticker: sticker });
          notifyStickerStaff(user.id, sticker);
          return this.sendReplyBox(`Requested: ${createRawStickerHtml(user.id, sticker, true)}`);
        } catch (error) {
          return this.errorReply(STICKER_UNKNOWN_ERROR);
        }
      },
      showall: "showapproved",
      showapproved() {
        this.runBroadcast();
        this.checkCan("avatar");
        const stickerList = Object.entries(stickers).filter(([userId, stickerStatus]) => stickerStatus.sticker !== void 0);
        if (!stickerList.length) {
          return this.sendReplyBox("<b><u>Approved Stickers</u></b><br /><div>No approved stickers.</div>");
        }
        const stickerListHtml = stickerList.map(
          ([
            userId,
            stickerStatus
          ]) => `<span style="display: inline-block;"><div>${getUsername(userId)}</div><div>${createRawStickerHtml(userId, stickerStatus.sticker)}</div></span>`
        ).join(" ");
        return this.sendReplyBox("<b><u>Approved Stickers</u></b><br />" + stickerListHtml);
      },
      showrequests: "requests",
      requests() {
        this.checkCan("avatar");
        const stickerList = Object.entries(stickers).filter(([userId, stickerStatus]) => stickerStatus.requestedSticker !== void 0);
        if (!stickerList.length) {
          return this.sendReplyBox(`<b><u>Sticker Requests</u></b><br /><div>No requests available.</div>`);
        }
        const requestListHtml = stickerList.map(
          ([userId, stickerStatus]) => createPendingStickerRequestHtml(userId, stickerStatus.requestedSticker)
        ).join("<br />");
        return this.sendReplyBox("<b><u>Sticker Requests</u></b><br />" + requestListHtml);
      },
      approve(target) {
        this.checkCan("avatar");
        const targetId = toID(target);
        const stickerStatus = stickers[targetId];
        if (!stickerStatus || !stickerStatus.requestedSticker) {
          return this.errorReply(`No sticker request for ${targetId}`);
        }
        updateStickerStatus(targetId, {
          sticker: stickerStatus.requestedSticker,
          requestedSticker: void 0
        });
        (0, import_lib.FS)(`./config/stickers/requests/${stickerStatus.requestedSticker}`).renameSync(`./config/stickers/${stickerStatus.requestedSticker}`);
        sendPM(`/html <div class="infobox"><div>Sticker approved</div><div>${createRawStickerHtml(targetId, stickerStatus.requestedSticker)}</div></div>`, targetId);
        removeStickerStaffNotificiation(targetId);
        return this.sendReplyBox(`<div><div>Approved sticker request of ${targetId}</div><div>${createRawStickerHtml(targetId, stickerStatus.requestedSticker)}</div></div>`);
      },
      deny(target) {
        this.checkCan("avatar");
        const targetId = toID(target);
        const stickerStatus = stickers[targetId];
        if (!stickerStatus || !stickerStatus.requestedSticker) {
          return this.errorReply(`No sticker request for ${targetId}`);
        }
        updateStickerStatus(targetId, {
          requestedSticker: void 0
        });
        (0, import_lib.FS)(`./config/stickers/requests/${stickerStatus.requestedSticker}`).unlinkIfExistsSync();
        sendPM("Your sticker request was denied.", targetId);
        removeStickerStaffNotificiation(targetId);
        return this.sendReply(`Denied sticker request of ${targetId}`);
      },
      delete(target, room, user) {
        this.checkCan("avatar");
        const targetId = toID(target);
        const stickerStatus = stickers[targetId];
        if (!stickerStatus || !stickerStatus.sticker) {
          return this.errorReply(`No sticker for ${targetId}`);
        }
        updateStickerStatus(targetId, {
          sticker: void 0
        });
        (0, import_lib.FS)(`./config/stickers/${stickerStatus.sticker}`).unlinkIfExistsSync();
        sendPM("Your sticker was deleted.", targetId);
        this.addGlobalModAction(`${user.name} deleted sticker of ${targetId}`);
        return this.sendReply(`Deleted sticker of ${targetId}`);
      },
      "": "help",
      help() {
        return this.parse("/help custom sticker");
      }
    },
    stickerhelp() {
      this.sendReplyBox(
        `<code>/custom sticker request [image url]</code>: requests a custom sticker. Requires: custom sticker access<br /><code>/custom sticker showall</code>: shows all approved stickers. Requires: @ or above<br /><code>/custom sticker showrequests</code>: shows all un-approved stickers. Requires: @ or above<br /><code>/custom sticker approve [user]</code>: approves the user's sticker request. Requires: @ or above<br /><code>/custom sticker deny [user]</code>: denies the user's sticker request. Requires: @ or above<br /><code>/cgif</code>: Use your sticker if you have one. Requires: custom sticker access`
      );
    },
    title: {
      set(target, room, user) {
        const canHaveTitle = Config.customtitle?.[user.id] !== void 0 || hasTourWins(TITLE_MINIMUM_TOUR_WINS, user);
        if (!canHaveTitle) {
          return this.errorReply(TITLE_USER_INELIGIBLE);
        }
        const title = formatTitle(target);
        if (title.length < 1 || title.length > 18)
          return this.errorReply(TITLE_INVALID);
        titles[user.id] = { title };
        saveTitles();
        this.sendReply(`|raw| Your title was successfully set. Log in again for it to appear. Title: ${title}`);
      },
      unset(target, room, user) {
        if (!titles[user.id])
          return this.errorReply(TITLE_USER_UNSET);
        delete titles[user.id];
        saveTitles();
        this.sendReply("|raw| Your title was successfully unset. Log in again for it to disappear.");
      },
      "": "help",
      help() {
        return this.parse("/help custom title");
      }
    },
    titlehelp() {
      this.sendReplyBox(
        `<code>/custom title set [title]</code>: sets your title to the desired text.<br /><code>/custom title unset</code>: removes your title.`
      );
    },
    flair: {
      async set(target, room, user) {
        const canHaveFlair = Config.customflair?.[user.id] !== void 0 || hasTourWins(FLAIR_MINIMUM_TOUR_WINS, user);
        if (!canHaveFlair) {
          return this.errorReply(FLAIR_USER_INELIGIBLE);
        }
        const [pokemon, pokemonMod, heightInput] = target.split(",").map((s) => s.trim());
        const flairUrl = getFlairUrl(pokemon, toID(pokemonMod));
        let heightOffset = parseInt(heightInput);
        if (Number.isNaN(heightOffset)) {
          heightOffset = defaultHeight;
        } else if (Math.abs(heightOffset) > maxHeightChange) {
          heightOffset = defaultHeight;
        } else {
          heightOffset = defaultHeight + Math.trunc(heightOffset);
        }
        try {
          await (0, import_lib.Net)(flairUrl).get();
        } catch (e) {
          return this.errorReply(getInvalidFlairErrorMessage(pokemonMod, pokemon));
        }
        flairs[user.id] = { pokemonId: pokemon, pokemonMod: toID(pokemonMod), heightOffset };
        saveFlairs();
        this.sendReply("|raw| Your flair was successfully set. It may take a while for it to show up. Flair:<br /><img src='" + flairUrl + "' width='40' height='30'>");
      },
      unset(target, room, user) {
        if (!flairs[user.id])
          return this.errorReply(FLAIR_USER_UNSET);
        delete flairs[user.id];
        saveFlairs();
        this.sendReply("|raw| Your flair was successfully unset. It may take a while for it to dissapear.");
      },
      "": "help",
      help() {
        return this.parse("/help custom flair");
      }
    },
    flairhelp() {
      this.sendReplyBox(
        `<code>/custom flair set [pokemon], [mod], [heightOffset]</code>: sets your flair to the desired pokemon from the specified mod (pokemon or clover) with an optional height adjustment.<br /><code>/custom flair unset</code>: removes your flair.`
      );
    },
    color: {
      async set(target, room, user) {
        const canHaveFlair = Config.customnamecolor?.[user.id] !== void 0 || hasTourWins(NAME_COLOR_MINIMUM_TOUR_WINS, user);
        if (!canHaveFlair)
          return this.errorReply(NAME_COLOR_USER_INELIGIBLE);
        const targetId = toID(target);
        if (!targetId || targetId.length > 18) {
          return this.errorReply(NAME_COLOR_INVALID);
        }
        const [res, error] = await LoginServer.request("updatenamecolor", {
          userid: user.id,
          source: targetId,
          by: user.id
        });
        if (error || !res || res.actionerror) {
          return this.errorReply("Unknown error setting custom name color. Please contact an administrator if this persists.");
        }
        return this.sendReply(`|raw| <username>${user.id}</username> was set to match <username>${targetId}</username>. It may take a while for it to show up.`);
      },
      async unset(target, room, user) {
        const [res, error] = await LoginServer.request("updatenamecolor", {
          userid: user.id,
          source: "",
          by: user.id
        });
        if (error || !res || res.actionerror) {
          return this.errorReply("Unknown error unsetting custom name color. Please contact an administrator if this persists.");
        }
        return this.sendReply("|raw| Your custon name color was successfully unset. It may take a while for it to dissapear.");
      },
      "": "help",
      help() {
        return this.parse("/help custom color");
      }
    },
    colorhelp() {
      this.sendReplyBox(
        `<code>/custom color set [username]</code>: sets your user color to match the specified user's color.<br /><code>/custom color unset</code>: removes your user color.`
      );
    },
    bg: "background",
    backgrounds: "background",
    background: {
      set(target, room, user) {
        const canHaveBackground = Config.custombackground?.[user.id] !== void 0 || hasTourWins(BACKGROUND_MINIMUM_TOUR_WINS, user);
        if (!canHaveBackground) {
          return this.errorReply(BACKGROUND_USER_INELIGIBLE);
        }
        const color = (0, import_parse_color.default)(target.trim());
        if (!color.rgb)
          return this.errorReply(BACKGROUND_INVALID);
        backgrounds[user.id] = {
          r: color.rgb[0],
          g: color.rgb[1],
          b: color.rgb[2]
        };
        saveBackgrounds();
        this.sendReply("|raw| Your background was successfully set. It may take a while for it to show up.");
      },
      unset(target, room, user) {
        if (!backgrounds[user.id])
          return this.errorReply(BACKGROUND_USER_UNSET);
        delete backgrounds[user.id];
        saveBackgrounds();
        this.sendReply("|raw| Your background was successfully unset. It may take a while for it to dissapear.");
      },
      "": "help",
      help() {
        return this.parse("/help custom background");
      }
    },
    backgroundhelp() {
      this.sendReplyBox(
        `<code>/custom background set [hex color]</code>: sets your user background color to the specified color.<br /><code>/custom background unset</code>: removes your user background color.`
      );
    },
    "": "help",
    help() {
      return this.parse("/help custom");
    },
    chatbg: "background",
    chatbackgrounds: "chatbackground",
    chatbackground: {
      set(target, room, user) {
        const canHaveBackground = Config.custombackground?.[user.id] !== void 0 || hasTourWins(CHAT_BACKGROUND_MINIMUM_TOUR_WINS, user);
        if (!canHaveBackground) {
          return this.errorReply(CHAT_BACKGROUND_USER_INELIGIBLE);
        }
        const color = (0, import_parse_color.default)(target.trim());
        if (!color.rgb)
          return this.errorReply(CHAT_BACKGROUND_INVALID);
        chatBackgrounds[user.id] = {
          r: color.rgb[0],
          g: color.rgb[1],
          b: color.rgb[2]
        };
        saveChatBackgrounds();
        this.sendReply("|raw| Your chat background was successfully set. It may take a while for it to show up.");
      },
      unset(target, room, user) {
        if (!chatBackgrounds[user.id])
          return this.errorReply(CHAT_BACKGROUND_USER_UNSET);
        delete chatBackgrounds[user.id];
        saveChatBackgrounds();
        this.sendReply("|raw| Your chat background was successfully unset. It may take a while for it to dissapear.");
      },
      "": "help",
      help() {
        return this.parse("/help custom chatbackground");
      }
    },
    chatbackgroundhelp() {
      this.sendReplyBox(
        `<code>/custom chatbackground set [hex color]</code>: sets your user chat background color to the specified color.<br /><code>/custom chatbackground unset</code>: removes your user chat background color.`
      );
    }
  },
  customhelp() {
    this.sendReplyBox(
      `<code>/custom avatar</code>: commands related to custom avatars. Try <code>/help custom avatar</code> for details. ${AVATAR_MINIMUM_TOUR_WINS} or more tour wins required to use.<br /><code>/custom title</code>: commands related to custom titles. Try <code>/help custom title</code> for details. ${TITLE_MINIMUM_TOUR_WINS} or more tour wins required to use.<br /><code>/custom flair</code>: commands related to custom flairs. Try <code>/help custom flair</code> for details. ${FLAIR_MINIMUM_TOUR_WINS} or more tour wins required to use.<br /><code>/custom color</code>: commands related to custom user colors. Try <code>/help custom color</code> for details. ${NAME_COLOR_MINIMUM_TOUR_WINS}C or more tour wins required to use.<br /><code>/custom background</code>: commands related to custom background colors. Try <code>/help custom background</code> for details. ${BACKGROUND_MINIMUM_TOUR_WINS} or more tour wins required to use.<br /><code>/custom chatbackground</code>: commands related to custom chat background colors. Try <code>/help custom chatbackground</code> for details. ${CHAT_BACKGROUND_MINIMUM_TOUR_WINS} or more tour wins required to use.<br /><code>/custom emoji</code>: commands related to custom emojis. Try <code>/help custom emoji</code> for details. ${EMOJI_MINIMUM_TOUR_WINS} or more tour wins required to use.<br /><code>/custom sticker</code>: commands related to custom stickers. Try <code>/help custom sticker</code> for details. ${STICKER_MINIMUM_TOUR_WINS} or more tour wins required to use.`
    );
  }
};
const loginfilter = (user) => {
  const title = titles[user.id];
  if (title) {
    user.customgroup = title.title;
  }
  const avatar = avatars[user.id];
  if (avatar && avatar.enabled && avatar.avatar) {
    user.avatar = avatar.avatar;
  }
};
const customEmojiRegex = /:!:/g;
const chatfilter = (message, user, room) => {
  if (room && !(0, import_emojis.checkEmojiLevel)(user, room))
    return message;
  const emojiStatus = emojis[user.id];
  if (!Punishments.hasPunishType(user.id, "EMOJIBAN") && emojiStatus && emojiStatus.emoji && customEmojiRegex.test(message)) {
    const prefix = message.startsWith("/html") ? "" : "/html ";
    return prefix + (0, import_utils.escapeHTML)(message).replace(customEmojiRegex, (0, import_emojis.createEmojiHtml)(`custom-${user.id}`, emojiStatus.emoji || ""));
  }
  return message;
};
//# sourceMappingURL=custom.js.map
