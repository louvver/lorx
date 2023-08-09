import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import { getProfile } from '#lib/utils/Services.js';
import { EmbedBuilder, type RestOrArray } from '@discordjs/builders';
import { ChatInputCommandInteraction, type APIEmbedField } from 'discord.js';

import { Config } from '#lib/Configuration.js';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'profile',
			description: 'Get information from a Discord profile.'
		});
	}

	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		const user = interaction.options.getUser('user');
		if (!user) return interaction.reply({ content: '`Please specify a user!`', ephemeral: true });
		if (user.bot) return interaction.reply({ content: '`The user is a bot!`', ephemeral: true });

		const data = await getProfile(user.id);
		if (!data) return interaction.reply({ content: '`User does not exist!`', ephemeral: true });
		const fields: RestOrArray<APIEmbedField> = [
			{
				name: '<:shb_a_gengar:1137464565181988894> Builds',
				value: `\`${data.builds}\``
			},
			{
				name: '<:shb_a_muerte:1137464788243447828> Victims',
				value: `\`${data.victims}\``
			},
			{
				name: '<:shb_a_weed:1137468096567853126> Estimated profits',
				value: `\`$${data.profits} USD\``
			},
			{
				name: 'Subscription',
				value: `\`${data.subscription?.name || 'None'}\``
			}
		];

		const embed = new EmbedBuilder()
			.setAuthor({ name: `${user.username}`, iconURL: `${user.avatarURL()}` })
			.setTitle(`See profile in Lovver!`)
			.setURL(`${Config.LOVVER_URL}/u/${user.id}`)
			.setThumbnail(`${user.avatarURL()}`)
			.setDescription(data?.bio || 'No bio!')
			.setFields(...fields)
			.setFooter({ text: '🖤 | lovver;', iconURL: this.client.user.avatarURL() as string })
			.setColor(0);
		await interaction.reply({ embeds: [embed], fetchReply: true });
	}
}
