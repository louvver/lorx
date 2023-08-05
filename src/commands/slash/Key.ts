import type {
	ChatInputCommandInteraction,
	GuildMemberRoleManager,
	User as DiscordUser,
	APIEmbedField,
	RestOrArray,
	AutocompleteInteraction
} from 'discord.js';
import type { Collection, OptionalId } from 'mongodb';
import type BaseClient from '#lib/BaseClient.js';
import { Database } from '#lib/Database.js';
import { Db as Configuration } from '#lib/Configuration.js';
import { getSubscription } from '#lib/utils/Function.js';
import Command from '#lib/structures/Command.js';
import { EmbedBuilder } from '@discordjs/builders';

const db = await Database.getInstance(Configuration).connect();

export default class extends Command {
	protected admin = '1137302875727478845' as const satisfies Readonly<string>;
	protected plans = ['monthly', 'annual', 'lifetime'] as ReadonlyArray<string>;
	protected collection: Collection<Document>;

	public constructor(client: BaseClient) {
		super(client, {
			name: 'key',
			description: 'Generate a product key to use our services',
			memberPermissions: ['Administrator']
		});
		this.collection = db.collection('users');
	}

	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		const isAdmin = (interaction.member.roles as GuildMemberRoleManager).cache.has(this.admin);
		const user = interaction.options.getUser('user') || interaction.options.getString('user');
		const plan = interaction.options.getString('plan');
		const id = (user as DiscordUser)?.id || (user as string);

		if (!isAdmin)
			return interaction.reply({
				content: '**`You do not have permissions to use this command!`**',
				ephemeral: true
			});
		if (!user) return interaction.reply({ content: '**`Please specify a user!`**', ephemeral: true });
		if (!plan || !this.plans.includes(plan.toLowerCase()))
			return interaction.reply({
				content: '**`Please select a valid plan!`**',
				ephemeral: true
			});

		const customer = (await this.collection.findOne({ id })) as IUser | null;
		if (!customer || customer.isBan)
			return interaction.reply({
				content: '**`User does not exists!`**',
				ephemeral: true
			});
		if (customer.subscription && customer.subscription.key)
			return interaction.reply({
				content: '**`This user already has a key!`**',
				ephemeral: true
			});
		const userFetched = await this.client.users.fetch(id);

		const subscription = getSubscription(plan);
		const data = {
			id,
			subscription
		} as IUser;
		const updateUser = new Object(data) as OptionalId<Document>;
		await this.collection.updateOne(
			{ id },
			{
				$set: updateUser
			}
		);

		const fields: RestOrArray<APIEmbedField> = [
			{
				name: 'Product Key:',
				value: `\`\`\`${subscription.key}\`\`\``
			},
			{
				name: 'Expire Date:',
				value: `\`\`\`${
					subscription.expires === Infinity ? 'Never' : new Date(subscription.expires).toLocaleString()
				}\`\`\``
			}
		];
		const embed = new EmbedBuilder();
		embed.setTitle('Thanks for Purchase');
		embed.setDescription(`Hello ${userFetched.username}, your current plan is: \`${subscription.name}\``);
		embed.addFields(...fields);
		embed.setColor(0);
		embed.setFooter({ text: this.client.user.username, iconURL: `${this.client.user.avatarURL()}` });
		userFetched.send({ embeds: [embed] });

		return interaction.reply({ content: 'The product key has been generated and sent to the customer!' });
	}
	public override autocomplete(interaction: AutocompleteInteraction<'cached' | 'raw'>) {
		const focusedValue = interaction.options.getFocused();
		const filtered = this.plans.filter((choice) => choice.startsWith(focusedValue));
		interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
	}
}
