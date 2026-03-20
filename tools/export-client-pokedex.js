"use strict";

/**
 * Gera o BattlePokedex do cliente a partir do dex já compilado em dist/.
 * Usar depois de `node build` no pokemon-showdown para não ficar só com entradas parciais
 * (o que quebra clique no teambuilder e ícones quando o ID é tipo articunoexmega).
 */
const fs = require("fs");
const path = require("path");

const distPokedex = path.resolve(__dirname, "../dist/data/pokedex.js");
const outFile = path.resolve(
	__dirname,
	"../../pokemon-showdown-client/play.pokemonshowdown.com/data/pokedex.js"
);

if (!fs.existsSync(distPokedex)) {
	console.error("Missing", distPokedex, "— run `node build` in pokemon-showdown first.");
	process.exit(1);
}

const { Pokedex } = require(distPokedex);
if (!Pokedex || typeof Pokedex !== "object") {
	console.error("dist/data/pokedex.js did not export Pokedex object.");
	process.exit(1);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `exports.BattlePokedex=${JSON.stringify(Pokedex)};`);
console.log("Wrote", outFile, `(${Object.keys(Pokedex).length} species)`);
