/**
 * Badges chat-plugin database handler.
 * @author MrSableye
 */
// @ts-ignore in case it isn't installed
import type * as Database from 'better-sqlite3';
import {FS, ProcessManager, Repl} from '../lib';
import {Config} from './config-loader';
import * as path from 'path';

/** Max badges per user */
export const MAX_OWNED_BADGES = 1000;
export const MAX_USER_BADGES = 100;
export const DEFAULT_FILE = FS('databases/badges.db').path;
const PM_TIMEOUT = 30 * 60 * 1000;

export interface DatabaseRequest {
	statement: string;
	type: 'all' | 'get' | 'run' | 'transaction';
	data: AnyObject | any[];
}

export interface DatabaseResult {
	/** Specify this to return an error message to the user */
	error?: string;
	result?: any;
}

export interface Badge {
	badge_id: string;
	badge_name: string;
	owner_id: string;
	file_name: string;
	create_date: number;
	badge_name_template?: string;
}

export type UpdateableBadgeAttribute = Exclude<keyof Badge, 'badge_id' | 'create_date'>;

export interface UserBadge extends Badge {
	user_id: string;
	priority: number;
	is_hidden: number;
	badge_data?: string;
}

export interface UserManagedBadge extends Badge {
	user_id: string;
}

/** Like Chat.ErrorMessage, but made for the subprocess so we can throw errors to the user not using errorMessage
 * because errorMessage crashes when imported (plus we have to spawn dex, etc, all unnecessary - this is easier)
 */
export class FailureMessage extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'FailureMessage';
		Error.captureStackTrace(this, FailureMessage);
	}
}

export class BadgesDatabase {
	file: string;
	constructor(file: string = DEFAULT_FILE) {
		this.file = file === ':memory:' ? file : path.resolve(file);
	}
	static setupDatabase(fileName?: string) {
		const file = fileName || process.env.filename || DEFAULT_FILE;
		const exists = FS(file).existsSync() || file === ':memory:';
		const database: Database.Database = new (require('better-sqlite3'))(file);
		if (!exists) {
			database.exec(FS('databases/schemas/badges.sql').readSync());
		} else {
			let val;
			try {
				val = database.prepare(`SELECT val FROM database_settings WHERE name = 'version'`).get().val;
			} catch (e) {}
			const actualVersion = FS(`databases/migrations/badges`).readdirIfExistsSync().length;
			if (val === undefined) {
				// hasn't been set up before, write new version.
				database.exec(FS('databases/schemas/badges.sql').readSync());
			}
			if (typeof val === 'number' && val !== actualVersion) {
				throw new Error(`Badges DB is out of date, please migrate to latest version.`);
			}
		}

		for (const k in FUNCTIONS) {
			database.function(k, FUNCTIONS[k]);
		}

		for (const k in ACTIONS) {
			try {
				statements[k] = database.prepare(ACTIONS[k as keyof typeof ACTIONS]);
			} catch (e) {
				throw new Error(`Badges DB statement crashed: ${ACTIONS[k as keyof typeof ACTIONS]} (${e.message})`);
			}
		}

		for (const k in TRANSACTIONS) {
			transactions[k] = database.transaction(TRANSACTIONS[k]);
		}

		return database;
	}
	all(statement: string, data: any[] | AnyObject) {
		return this.query({type: 'all', data, statement});
	}
	transaction(statement: string, data: any[] | AnyObject) {
		return this.query({data, statement, type: 'transaction'});
	}
	run(statement: string, data: any[] | AnyObject) {
		return this.query({statement, data, type: 'run'});
	}
	get(statement: string, data: any[] | AnyObject) {
		return this.query({statement, data, type: 'get'});
	}
	private async query(input: DatabaseRequest) {
		const process = PM.acquire();
		if (!process) throw new Error(`Missing badges process`);
		const result = await process.query(input);
		if (result.error) {
			throw new Chat.ErrorMessage(result.error);
		}
		return result.result;
	}
	getBadge(badgeID: string): Promise<Badge | undefined> {
		return this.get('getBadge', [badgeID]);
	}
	getBadges(): Promise<Badge[]> {
		return this.all('getBadges', []);
	}
	getOwnedBadges(ownerID: string): Promise<Badge[]> {
		return this.all('getOwnedBadges', [ownerID, MAX_OWNED_BADGES]);
	}
	getUserBadges(userID: string): Promise<UserBadge[]> {
		return this.all('getUserBadges', [userID, MAX_USER_BADGES]);
	}
	getVisibleUserBadges(userID: string): Promise<UserBadge[]> {
		return this.all('getVisibleUserBadges', [userID, MAX_USER_BADGES]);
	}
	async getBadgeOwners(badgeID: string, requesterID: string, overridePermissions: boolean): Promise<UserBadge[]> {
		return (await this.transaction('getBadgeOwners', [badgeID, requesterID, overridePermissions])).result;
	}
	createBadge(badgeID: string, badgeName: string, ownerID: string, filePath: string, badgeNameTemplate?: string) {
		return this.transaction('createBadge', [badgeID, badgeName, ownerID, filePath, badgeNameTemplate]);
	}
	deleteBadge(badgeID: string, requesterID: string, overridePermissions: boolean) {
		return this.transaction('deleteBadge', [badgeID, requesterID, overridePermissions]);
	}
	updateBadgeAttribute(
		badgeID: string,
		attributeName: UpdateableBadgeAttribute,
		attributeValue: any,
		requesterID: string,
		overridePermissions: boolean,
	) {
		return this.transaction('updateBadgeAttribute', [badgeID, attributeName, attributeValue, requesterID, overridePermissions]);
	}
	addBadgeToUser(userID: string, badgeID: string, requesterID: string, overridePermissions: boolean) {
		return this.transaction('addBadgeToUser', [userID, badgeID, requesterID, overridePermissions]);
	}
	removeBadgeFromUser(userID: string, badgeID: string, requesterID: string, overridePermissions: boolean) {
		return this.transaction('removeBadgeFromUser', [userID, badgeID, requesterID, overridePermissions]);
	}
	deleteUserBadges(badgeID: string) {
		return this.run('deleteUserBadges', [badgeID]);
	}
	toggleBadgeVisibility(userID: string, badgeID: string, isVisible: boolean) {
		return this.transaction('toggleBadgeVisibility', [userID, badgeID, isVisible]);
	}
	updateBadgePriority(userID: string, badgeID: string, priority: number) {
		return this.transaction('updateBadgePriority', [userID, badgeID, priority]);
	}
	updateBadgeData(userID: string, badgeID: string, badgeData: any, requesterID: string, overridePermissions: boolean) {
		return this.transaction('updateBadgeData', [userID, badgeID, JSON.stringify(badgeData), requesterID, overridePermissions]);
	}
	getUserManagedBadges(userID: string): Promise<UserManagedBadge[]> {
		return this.all('getUserManagedBadges', [userID]);
	}
	getBadgeManagers(badgeID: string): Promise<UserManagedBadge[]> {
		return this.all('getBadgeManagers', [badgeID]);
	}
	addManagedBadgeToUser(userID: string, badgeID: string, requesterID: string, overridePermissions: boolean) {
		return this.transaction('addManagedBadgeToUser', [userID, badgeID, requesterID, overridePermissions]);
	}
	removeManagedBadgeFromUser(userID: string, badgeID: string, requesterID: string, overridePermissions: boolean) {
		return this.transaction('removeManagedBadgeFromUser', [userID, badgeID, requesterID, overridePermissions]);
	}
	deleteUserManagedBadges(badgeID: string) {
		return this.run('deleteUserManagedBadges', [badgeID]);
	}
}

const statements: {[k: string]: Database.Statement} = {};
const transactions: {[k: string]: Database.Transaction} = {};

const ACTIONS = {
	getBadge: `SELECT * FROM badges WHERE badge_id = ?`,
	getBadges: `SELECT * FROM badges`,
	getOwnedBadges: `SELECT * FROM badges WHERE owner_id = ? LIMIT ?`,
	createBadge: `INSERT INTO badges (badge_id, badge_name, owner_id, file_name, create_date, badge_name_template) VALUES (?, ?, ?, ?, ?, ?)`,
	deleteBadge: `DELETE FROM badges WHERE badge_id = ?`,
	updateBadgeName: `UPDATE badges SET badge_name = ? WHERE badge_id = ?`,
	updateBadgeOwner: `UPDATE badges SET owner_id = ? WHERE badge_id = ?`,
	updateBadgeFileName: `UPDATE badges SET file_name = ? WHERE badge_id = ?`,
	updateBadgeNameTemplate: `UPDATE badges SET badge_name_template = ? WHERE badge_id = ?`,
	findBadge: `SELECT * FROM badges WHERE badge_id = ?`,
	countOwnedBadges: `SELECT count(*) as num FROM badges WHERE owner_id = ?`,
	getUserBadges: (
		`SELECT user_badges.user AS user_id, badges.badge_id, badges.badge_name, badges.badge_name_template, badges.file_name, user_badges.priority, user_badges.is_hidden, user_badges.badge_data, badges.create_date ` +
		`FROM badges INNER JOIN user_badges ON badges.badge_id = user_badges.badge WHERE user_badges.user = ? LIMIT ?`
	),
	getVisibleUserBadges: (
		`SELECT user_badges.user AS user_id, badges.badge_id, badges.badge_name, badges.badge_name_template, badges.file_name, user_badges.priority, user_badges.is_hidden, user_badges.badge_data, badges.create_date ` +
		`FROM badges INNER JOIN user_badges ON badges.badge_id = user_badges.badge WHERE (user_badges.user = ? AND user_badges.is_hidden = 0) LIMIT ?`
	),
	getBadgeOwners: (
		`SELECT user_badges.user AS user_id, badges.badge_id, badges.badge_name, badges.badge_name_template, badges.file_name, user_badges.priority, user_badges.is_hidden, user_badges.badge_data, badges.create_date ` +
		`FROM badges INNER JOIN user_badges ON badges.badge_id = user_badges.badge WHERE (user_badges.badge = ?)`
	),
	countUserBadges: `SELECT count(*) as num FROM user_badges WHERE user = ?`,
	addBadgeToUser: `INSERT INTO user_badges(user, badge, priority, is_hidden, create_date) VALUES (?, ?, ?, 0, ?)`,
	removeBadgeFromUser: `DELETE FROM user_badges WHERE (user = ? AND badge = ?)`,
	deleteUserBadges: `DELETE FROM user_badges WHERE (badge = ?)`,
	toggleBadgeVisibility: `UPDATE user_badges SET is_hidden = ? WHERE (user = ? AND badge = ?)`,
	updateBadgePriority: `UPDATE user_badges SET priority = ? WHERE (user = ? AND badge = ?)`,
	updateBadgeData: `UPDATE user_badges SET badge_data = ? WHERE (user = ? AND badge = ?)`,
	findUserBadge: `SELECT * FROM user_badges WHERE (user = ? AND badge = ?)`,
	findMaxPriority: `SELECT MAX(priority) as num FROM user_badges WHERE (user = ?)`,
	getUserManagedBadges: (
		`SELECT user_managed_badges.user AS user_id, badges.badge_id, badges.badge_name, badges.file_name, badges.create_date, badges.badge_name_template ` +
		`FROM badges INNER JOIN user_managed_badges ON badges.badge_id = user_managed_badges.badge WHERE user_managed_badges.user = ?`
	),
	getBadgeManagers: (
		`SELECT user_managed_badges.user AS user_id, badges.badge_id, badges.badge_name, badges.file_name, badges.create_date, badges.badge_name_template ` +
		`FROM badges INNER JOIN user_managed_badges ON badges.badge_id = user_managed_badges.badge WHERE (user_managed_badges.badge = ?)`
	),
	addManagedBadgeToUser: `INSERT INTO user_managed_badges(user, badge) VALUES (?, ?)`,
	removeManagedBadgeFromUser: `DELETE FROM user_managed_badges WHERE (user = ? AND badge = ?)`,
	deleteUserManagedBadges: `DELETE FROM user_managed_badges WHERE (badge = ?)`,
	findUserManagedBadge: `SELECT * FROM user_managed_badges WHERE (user = ? AND badge = ?)`,
};

const FUNCTIONS: {[k: string]: (...input: any[]) => any} = {};

const TRANSACTIONS: {[k: string]: (input: any[]) => DatabaseResult} = {
	createBadge: requests => {
		for (const request of requests) {
			const [badgeID, badgeName, ownerID, filePath, badgeNameTemplate] = request;

			const existingBadge = statements.findBadge.all(badgeID);
			if (existingBadge.length) {
				throw new FailureMessage(`A badge with id '${badgeID}' already exists.`);
			}

			const ownedBadges = statements.countOwnedBadges.get([ownerID])['num'];
			if (ownedBadges >= MAX_OWNED_BADGES) {
				throw new FailureMessage(`You own the maximum number of badges.`);
			}

			statements.createBadge.run(badgeID, badgeName, ownerID, filePath, Date.now(), badgeNameTemplate);
		}
		return {result: []};
	},
	deleteBadge: requests => {
		for (const request of requests) {
			const [badgeID, requesterID, overridePermissions] = request;

			const existingBadge = statements.findBadge.all(badgeID);
			if (!existingBadge.length) {
				throw new FailureMessage(`No badge with id '${badgeID}' exists.`);
			}

			if (!overridePermissions && (existingBadge[0].owner_id !== requesterID)) {
				throw new FailureMessage(`You do not own '${badgeID}'.`);
			}

			statements.deleteBadge.run(badgeID);
		}
		return {result: []};
	},
	updateBadgeAttribute: requests => {
		for (const request of requests) {
			const [badgeID, attributeName, attributeValue, requesterID, overridePermissions] = request;

			const existingBadge = statements.findBadge.all(badgeID);
			if (!existingBadge.length) {
				throw new FailureMessage(`No badge with id '${badgeID}' exists.`);
			}

			if (!overridePermissions && (existingBadge[0].owner_id !== requesterID)) {
				throw new FailureMessage(`You do not own '${badgeID}'.`);
			}

			if (attributeName === 'badge_name') {
				statements.updateBadgeName.run(attributeValue, badgeID);
			} else if (attributeName === 'owner_id') {
				statements.updateBadgeOwner.run(attributeValue, badgeID);
			} else if (attributeName === 'file_name') {
				statements.updateBadgeFileName.run(attributeValue, badgeID);
			} else if (attributeName === 'badge_name_template') {
				statements.updateBadgeNameTemplate.run(attributeValue, badgeID);
			}
		}
		return {result: []};
	},
	getBadgeOwners: requests => {
		const result = [];
		for (const request of requests) {
			const [badgeID, requesterID, overridePermissions] = request;

			const existingBadge = statements.findBadge.all(badgeID);
			if (!existingBadge.length) {
				throw new FailureMessage(`No badge with id '${badgeID}' exists.`);
			}

			if (!overridePermissions && (existingBadge[0].owner_id !== requesterID)) {
				throw new FailureMessage(`You do not own '${badgeID}'.`);
			}

			const badgeOwners = statements.getBadgeOwners.all(badgeID);
			result.push(...badgeOwners);
		}
		return {result};
	},
	addBadgeToUser: requests => {
		for (const request of requests) {
			const [userID, badgeID, requesterID, overridePermissions] = request;

			const existingBadge = statements.findBadge.all(badgeID);
			if (!existingBadge.length) {
				throw new FailureMessage(`No badge with id '${badgeID}' exists.`);
			}

			const badgeManagers = statements.getBadgeManagers.all(badgeID);
			const isManager = badgeManagers.some((badgeManager) => badgeManager.user_id === requesterID);

			if (!overridePermissions && (existingBadge[0].owner_id !== requesterID) && !isManager) {
				throw new FailureMessage(`You do not own or manage '${badgeID}'.`);
			}

			const userOwnedBadges = statements.countUserBadges.get(userID)['num'];
			if (userOwnedBadges >= MAX_USER_BADGES) {
				throw new FailureMessage(`User '${userID}' has the maximum number of badges.`);
			}

			const existingOwnedBadge = statements.findUserBadge.all(userID, badgeID);
			if (existingOwnedBadge.length) {
				throw new FailureMessage(`User '${userID}' already has badge '${badgeID}'.`);
			}

			const maxBadgePriority = statements.findMaxPriority.get(userID)['num'] || 0;

			statements.addBadgeToUser.run(userID, badgeID, maxBadgePriority + 1, Date.now());
		}
		return {result: []};
	},
	removeBadgeFromUser: requests => {
		for (const request of requests) {
			const [userID, badgeID, requesterID, overridePermissions] = request;

			const existingBadge = statements.findBadge.all(badgeID);
			if (!existingBadge.length) {
				throw new FailureMessage(`No badge with id '${badgeID}' exists.`);
			}

			const badgeManagers = statements.getBadgeManagers.all(badgeID);
			const isManager = badgeManagers.some((badgeManager) => badgeManager.user_id === requesterID);

			if (!overridePermissions && (existingBadge[0].owner_id !== requesterID) && !isManager) {
				throw new FailureMessage(`You do not own or manage '${badgeID}'.`);
			}

			const existingOwnedBadge = statements.findUserBadge.all(userID, badgeID);
			if (!existingOwnedBadge.length) {
				throw new FailureMessage(`User '${userID}' does not have badge '${badgeID}'.`);
			}

			statements.removeBadgeFromUser.run(userID, badgeID);
		}
		return {result: []};
	},
	toggleBadgeVisibility: requests => {
		for (const request of requests) {
			const [userID, badgeID, isVisible] = request;

			const existingOwnedBadge = statements.findUserBadge.all(userID, badgeID);
			if (!existingOwnedBadge.length) {
				throw new FailureMessage(`User '${userID}' does not have badge '${badgeID}'.`);
			}

			statements.toggleBadgeVisibility.run(isVisible ? 0 : 1, userID, badgeID);
		}
		return {result: []};
	},
	updateBadgePriority: requests => {
		for (const request of requests) {
			const [userID, badgeID, priority] = request;

			const existingOwnedBadge = statements.findUserBadge.all(userID, badgeID);
			if (!existingOwnedBadge.length) {
				throw new FailureMessage(`User '${userID}' does not have badge '${badgeID}'.`);
			}

			statements.updateBadgePriority.run(priority, userID, badgeID);
		}
		return {result: []};
	},
	updateBadgeData: requests => {
		for (const request of requests) {
			const [userID, badgeID, badgeData, requesterID, overridePermissions] = request;

			const existingOwnedBadge = statements.findUserBadge.all(userID, badgeID);
			if (!existingOwnedBadge.length) {
				throw new FailureMessage(`User '${userID}' does not have badge '${badgeID}'.`);
			}

			const badgeManagers = statements.getBadgeManagers.all(badgeID);
			const isManager = badgeManagers.some((badgeManager) => badgeManager.user_id === requesterID);

			if (!overridePermissions && (existingOwnedBadge[0].owner_id !== requesterID) && !isManager) {
				throw new FailureMessage(`You do not own or manage '${badgeID}'.`);
			}

			statements.updateBadgeData.run(badgeData, userID, badgeID);
		}
		return {result: []};
	},
	addManagedBadgeToUser: requests => {
		for (const request of requests) {
			const [userID, badgeID, requesterID, overridePermissions] = request;

			const existingBadge = statements.findBadge.all(badgeID);
			if (!existingBadge.length) {
				throw new FailureMessage(`No badge with id '${badgeID}' exists.`);
			}

			if (!overridePermissions && (existingBadge[0].owner_id !== requesterID)) {
				throw new FailureMessage(`You do not own '${badgeID}'.`);
			}

			const existingManagedBadge = statements.findUserManagedBadge.all(userID, badgeID);
			if (existingManagedBadge.length) {
				throw new FailureMessage(`User '${userID}' already manages '${badgeID}'.`);
			}

			statements.addManagedBadgeToUser.run(userID, badgeID);
		}
		return {result: []};
	},
	removeManagedBadgeFromUser: requests => {
		for (const request of requests) {
			const [userID, badgeID, requesterID, overridePermissions] = request;

			const existingBadge = statements.findBadge.all(badgeID);
			if (!existingBadge.length) {
				throw new FailureMessage(`No badge with id '${badgeID}' exists.`);
			}

			if (!overridePermissions && (existingBadge[0].owner_id !== requesterID)) {
				throw new FailureMessage(`You do not own '${badgeID}'.`);
			}

			const existingManagedBadge = statements.findUserManagedBadge.all(userID, badgeID);
			if (!existingManagedBadge.length) {
				throw new FailureMessage(`User '${userID}' does not manage '${badgeID}'.`);
			}

			statements.removeManagedBadgeFromUser.run(userID, badgeID);
		}
		return {result: []};
	},
};

export const PM = new ProcessManager.QueryProcessManager<DatabaseRequest, DatabaseResult>(module, query => {
	const {type, statement, data} = query;
	const start = Date.now();
	const result: DatabaseResult = {};
	try {
		switch (type) {
		case 'run':
			result.result = statements[statement].run(data);
			break;
		case 'get':
			result.result = statements[statement].get(data);
			break;
		case 'transaction':
			result.result = transactions[statement]([data]);
			break;
		case 'all':
			result.result = statements[statement].all(data);
			break;
		}
	} catch (e) {
		if (!e.name.endsWith('FailureMessage')) {
			result.error = "Sorry! The database process crashed. We've been notified and will fix this.";
			Monitor.crashlog(e, "A badges database process", query);
		} else {
			result.error = e.message;
		}
		return result;
	}
	const delta = Date.now() - start;
	if (delta > 1000) {
		Monitor.slow(`[Slow badges query] ${JSON.stringify(query)}`);
	}
	return result;
}, PM_TIMEOUT, message => {
	if (message.startsWith('SLOW\n')) {
		Monitor.slow(message.slice(5));
	}
});

if (require.main === module) {
	global.Config = (require as any)('./config-loader').Config;
	if (Config.usesqlite) {
		BadgesDatabase.setupDatabase();
	}
	global.Monitor = {
		crashlog(error: Error, source = 'A badges database process', details: AnyObject | null = null) {
			const repr = JSON.stringify([error.name, error.message, source, details]);
			process.send!(`THROW\n@!!@${repr}\n${error.stack}`);
		},
		slow(message: string) {
			process.send!(`CALLBACK\nSLOW\n${message}`);
		},
	};
	process.on('uncaughtException', err => {
		if (Config.crashguard) {
			Monitor.crashlog(err, 'A badges child process');
		}
	});
	// eslint-disable-next-line no-eval
	Repl.start(`badges-${process.pid}`, cmd => eval(cmd));
} else {
	PM.spawn(Config.badgesprocesses || 1);
}
