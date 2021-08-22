import { ApplyOptions } from '@sapphire/decorators';
import type { WeebCommandOptions } from '#structures/WeebCommand';
import { WeebCommand } from '#structures/WeebCommand';

@ApplyOptions<WeebCommandOptions>({
  description: 'Lick someone',
  embedMessage: '{author} licked {user} 👅',
})
export default class UserCommand extends WeebCommand {}
