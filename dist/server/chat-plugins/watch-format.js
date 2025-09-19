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
var watch_format_exports = {};
__export(watch_format_exports, {
  commands: () => commands,
  handlers: () => handlers
});
module.exports = __toCommonJS(watch_format_exports);
var import_lib = require("../../lib");
const roomBattleReporterConfig = JSON.parse(
  (0, import_lib.FS)("config/chat-plugins/room-battles.json").readIfExistsSync() || "{}"
);
const saveRoomBattleReporterConfig = () => {
  (0, import_lib.FS)("config/chat-plugins/room-battles.json").writeUpdate(() => JSON.stringify(roomBattleReporterConfig));
};
const addRoom = (formatId, roomId) => {
  const rooms = roomBattleReporterConfig[formatId] || { rooms: {} };
  rooms.rooms[roomId] = true;
  roomBattleReporterConfig[formatId] = rooms;
  saveRoomBattleReporterConfig();
};
const removeRoom = (formatId, roomId) => {
  const rooms = roomBattleReporterConfig[formatId] || { rooms: {} };
  delete rooms.rooms[roomId];
  roomBattleReporterConfig[formatId] = rooms;
  saveRoomBattleReporterConfig();
};
const getRooms = (formatId) => {
  const rooms = roomBattleReporterConfig[formatId];
  if (rooms) {
    return Object.keys(rooms.rooms).map((roomId) => Rooms.get(roomId)).filter((room) => room !== void 0);
  }
  return [];
};
const commands = {
  watchformat(target, room) {
    if (!room) {
      throw new Chat.ErrorMessage(`Command must be used from a room.`);
    }
    this.checkCan("editroom", null, room);
    const format = Dex.formats.get(target);
    if (!format.exists) {
      throw new Chat.ErrorMessage(`Format ${format} doesn't exist.`);
    }
    addRoom(format.id, room.roomid);
    return this.sendReply(`Successfully added ${format.name} to watched formats.`);
  },
  unwatchformat(target, room) {
    if (!room) {
      throw new Chat.ErrorMessage(`Command must be used from a room.`);
    }
    this.checkCan("editroom", null, room);
    const format = Dex.formats.get(target);
    if (!format) {
      throw new Chat.ErrorMessage(`Format ${format} doesn't exist.`);
    }
    removeRoom(format.id, room.roomid);
    return this.sendReply(`Successfully removed ${format.name} to watched formats.`);
  },
  unwatchformathelp: "watchformathelp",
  watchformathelp() {
    this.sendReplyBox(
      "<code>/watchformat [format]</code>: adds a format to report battles on in the current room. Requires: #, &<br /><code>/unwatchformat [format]</code>: removes a format to report battles on in the current room. Requires: #, &"
    );
  }
};
const handledBattles = {};
const handlers = {
  onBattleStart(user, room) {
    const players = [room.p1, room.p2, room.p3, room.p4].filter((player) => player !== null);
    const reportPlayers = players.map((p) => p.getIdentity()).join("|");
    const battleRoomId = toID(room.format);
    if (handledBattles[battleRoomId]) {
      return;
    }
    const formatRooms = getRooms(battleRoomId);
    formatRooms.forEach((formatRoom) => {
      formatRoom.add(`|b|${room.roomid}|${reportPlayers}`).update();
    });
    handledBattles[battleRoomId] = true;
  },
  onBattleEnd(battle) {
    delete handledBattles[battle.roomid];
  }
};
//# sourceMappingURL=watch-format.js.map
