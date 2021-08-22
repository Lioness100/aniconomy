import { ApplyOptions } from '@sapphire/decorators';
import type { WeebCommandOptions } from '#structures/WeebCommand';
import { WeebCommand } from '#structures/WeebCommand';

@ApplyOptions<WeebCommandOptions>({
  description: 'Cuddle someone',
  embedMessage: '{author} cuddled {user} ☺',
})
export default class UserCommand extends WeebCommand {}
