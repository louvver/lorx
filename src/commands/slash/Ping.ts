import type BaseClient from '#lib/BaseClient.js';
import { Config } from '#lib/Configuration.js';
import Command from '#lib/structures/Command.js';
import axios from 'axios';
import type { ChatInputCommandInteraction } from 'discord.js';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'ping',
			description: 'Send a ping request.'
		});
	}
	private async getWebsiteStatus(): Promise<number> {
		const response = await axios.get(Config.LOVVER_URL);
		return response.status;
	}
	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		const status = await this.getWebsiteStatus();
		const replies = [
			`***Websocket:*** \`${Math.round(this.client.ws.ping)}ms\``,
			`***Latency:*** \`${Math.round(Date.now() - interaction.createdTimestamp)}ms\``,
			`***Website:*** \`${status === 200 ? `Online | HTTP ${status}` : `Offline | HTTP ${status}`}\``
		].join('\n');

		return interaction.reply({ content: replies });
	}
}
