import type BaseClient from '#lib/BaseClient.js';
import type { PermissionsString } from 'discord.js';
import type { EventEmitter } from 'node:events';

declare global {
	interface DatabaseOptions {
		url: Readonly<string>;
		name: Readonly<string>;
	}

	interface ClientOptions {
		token: any;
		version: string;
		owners: string[];
		debug: boolean;
		defaultPermissions: PermissionsString[];
	}

	interface CommandOptions {
		name: string;
		description?: string;
		memberPermissions?: PermissionsString[];
		clientPermissions?: PermissionsString[];
		disabled?: boolean;
		context?: boolean;
		guildOnly?: boolean;
		ownerOnly?: boolean;
	}

	interface EventOptions {
		name: string;
		once?: boolean;
		emitter?: keyof BaseClient | EventEmitter;
	}

	interface IUser {
		id: string;
		username: string;
		discriminator: string;
		isAdmin: boolean;
		isBan: boolean;
		bio?: string;
		subscription?: ISubscription;
	}

	interface IProfile extends IUser {
		victims: number;
		builds: number;
		profits: number;
	}

	interface ISubscription {
		name: string;
		key: string;
		expires: Date | number;
	}

	interface IBadge {
		emoji: string;
		name: string;
	}

	interface IAccount {
		type: string;
		username: string;
	}

	interface IPremium {
		boost_actual: {
			emoji: string;
			date: string;
		};
		boost_up?: {
			emoji: string;
			date: Date;
		};
	}

	interface IUser {
		id: string;
		name: string | null;
		username: string;
		legacy_username?: string;
		pronouns: string;
		avatar: string;
		badges: IBadge[] | null;
		accounts: IAccount[];
		premium?: IPremium;
	}
}
