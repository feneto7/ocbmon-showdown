var Config = Config || {};

/* version */ Config.version = "0";

Config.bannedHosts = ['cool.jit.su', 'pokeball-nixonserver.rhcloud.com'];

Config.whitelist = [
	'wikipedia.org',

	// The full list is maintained outside of this repository so changes to it
	// don't clutter the commit log. Feel free to copy our list for your own
	// purposes; it's here: https://play.pokemonshowdown.com/config/config.js

	// If you would like to change our list, simply message Zarel on Smogon or
	// Discord.
];

Config.roomsFirstOpenScript = function () {
};

Config.customcolors = {
	'zarel': 'aeo'
};
/*** Begin automatically generated configuration ***/
Config.version = "0.11.2";

Config.routes = {
	root: 'feneto7.github.io/ocbmon-showdown-client',
	client: 'feneto7.github.io/ocbmon-showdown-client',
	clientProtocol: 'https',
	dex: 'dex.pokemonshowdown.com',
	replays: 'feneto7.github.io/ocbmon-showdown-client/replays',
	users: 'feneto7.github.io/ocbmon-showdown-client/users',
};

Config.defaultserver = {
	id: 'ocbmon-showdown',
	host: 'ocbmon-showdown.onrender.com',
	port: '443',
	httpport: 443,
	altport: 80,
	registered: true,
	https: true,
	afd: false,
	loginOverride: null,
};

// Configuração adicional para garantir carregamento correto dos dados
Config.autoConnect = true;
Config.autoReconnect = true;
Config.reconnectDelay = 5000;

// Configuração específica para GitHub Pages
Config.testclient = false;
Config.testclientProtocol = 'https';

/*** End automatically generated configuration ***/
