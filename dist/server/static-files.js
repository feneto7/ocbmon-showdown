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
var static_files_exports = {};
__export(static_files_exports, {
  serveStaticFile: () => serveStaticFile,
  staticFileMiddleware: () => staticFileMiddleware
});
module.exports = __toCommonJS(static_files_exports);
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var url = __toESM(require("url"));
const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};
function serveStaticFile(req, res) {
  const parsedUrl = url.parse(req.url || "");
  let pathname = parsedUrl.pathname || "/";
  if (pathname === "/") {
    return serveFile(req, res, "/public/index.html");
  }
  if (pathname.startsWith("/client/")) {
    const clientPath = pathname.replace("/client/", "/public/client/");
    return serveFile(req, res, clientPath);
  }
  if (pathname.startsWith("/public/")) {
    return serveFile(req, res, pathname);
  }
  if (pathname === "/favicon.ico" || pathname.includes("favicon")) {
    return serveFile(req, res, "/public/favicon.ico");
  }
  return serveFile(req, res, "/public" + pathname);
}
function serveFile(req, res, pathname) {
  try {
    const cleanPath = pathname.split("?")[0];
    const safePath = path.normalize(cleanPath).replace(/^(\.\.[\/\\])+/, "");
    const filePath = path.join(__dirname, "..", safePath);
    console.log(`Caminho completo: ${filePath}`);
    console.log(`Tentando servir: ${pathname} -> ${filePath}`);
    if (pathname.includes("favicon")) {
      console.log(`Favicon request: ${pathname}, file exists: ${fs.existsSync(filePath)}`);
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      console.log(`Diret\xF3rio encontrado, tentando index.html: ${filePath}`);
      return serveFile(req, res, path.join(safePath, "index.html"));
    }
    if (!fs.existsSync(filePath)) {
      console.log(`Arquivo n\xE3o encontrado: ${filePath}`);
      return false;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": content.length,
      "Cache-Control": "public, max-age=3600",
      // Cache por 1 hora
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end(content);
    return true;
  } catch (error) {
    console.error("Erro ao servir arquivo:", error);
    return false;
  }
}
function staticFileMiddleware(req, res, next) {
  if (!serveStaticFile(req, res)) {
    next();
  }
}
//# sourceMappingURL=static-files.js.map
