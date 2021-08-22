import { ApplyOptions } from '@sapphire/decorators';
import type { WeebCommandOptions } from '#structures/WeebCommand';
import { WeebCommand } from '#structures/WeebCommand';

@ApplyOptions<WeebCommandOptions>({
  description: 'Slap someone',
  embedMessage: '{author} slapped {user} 💔',
})
export default class UserCommand extends WeebCommand {}
