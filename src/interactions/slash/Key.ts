import {
	type APIApplicationCommand,
	type APIApplicationCommandOption,
	ApplicationCommandOptionType,
	ApplicationCommandType
} from 'discord-api-types/v10';

export default {
	name: 'key',
	description: 'Generate a product key to use our services',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'user',
			description: 'Customer to give access.',
			type: ApplicationCommandOptionType.User || ApplicationCommandOptionType.String,
			required: true
		},
		{
			name: 'plan',
			description: 'Subscription plan type',
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true
		}
	] as APIApplicationCommandOption[],
	dm_permission: false
} as APIApplicationCommand;
