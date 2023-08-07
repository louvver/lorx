import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import { getUser, getFlags } from '#lib/utils/Function.js';
import { EmbedBuilder, type RestOrArray } from '@discordjs/builders';
import { ChatInputCommandInteraction, type APIEmbedField, User } from 'discord.js';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'uid',
			description: 'Get information from a Discord profile.'
		});
	}

	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		const arg = interaction.options.getUser('user') || interaction.options.getString('user');
		if (!arg) return interaction.reply({ content: '**`Please specify a user!`**', ephemeral: true });
		const user = await this.client.users.fetch(typeof arg === 'object' ? arg.id : arg);
		if (user.bot) return interaction.reply({ content: '`The user is a bot!`', ephemeral: true });

		const response = await getUser(typeof arg === 'object' ? arg.id : arg);
		const data: IUser | User = response ? { ...response } : user;
		const flags = getFlags(user.flags?.bitfield);
		const badges = response?.badges ? response.badges.map(({ emoji }) => emoji).join(' ') : null;

		const fields: RestOrArray<APIEmbedField> = [
			{
				name: `<:shb_a_luna:1137464785785602149> User`,
				value: `\`${data.username}\` ${
					response?.legacy_username ? `(<:lovver_notag:1127326605346357268> ${response.legacy_username})` : ''
				}`
			},
			{
				name: '<:shb_a_glock:1137464567283331103> ID',
				value: `\`${data.id}\``
			},
			{
				name: `${response?.premium?.boost_actual.emoji} Actual Boost`,
				value: `\`${response?.premium?.boost_actual.date}\``
			},
			{
				name: `${response?.premium?.boost_up?.emoji} Next Boost`,
				value: `\`${response?.premium?.boost_up?.date.toLocaleString()}\``
			},
			{
				name: `<:shb_a_muerte:1137464788243447828> Badges`,
				value: `${badges || flags || '`None`'}`
			},
			{
				name: '<:shb_a_blackblood:1137464208385130607> Accounts',
				value: `\`${
					response?.accounts.length ? response?.accounts.map((account: IAccount) => account.type).join(', ') : '`None`'
				}\``
			}
		].filter((field) => !field.name.startsWith('undefined'));

		const embed = new EmbedBuilder()
			.setAuthor({ name: `${response?.name || data.username}`, iconURL: `${response?.avatar || user.avatarURL()}` })
			.setThumbnail(`${response?.avatar || user.avatarURL()}`)
			.setFields(...fields)
			.setFooter({ text: '🖤 | lovver;', iconURL: this.client.user.avatarURL() as string })
			.setColor(0);
		await interaction.reply({ embeds: [embed], fetchReply: true });
	}
}
