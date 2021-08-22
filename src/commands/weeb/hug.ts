import { ApplyOptions } from '@sapphire/decorators';
import type { WeebCommandOptions } from '#structures/WeebCommand';
import { WeebCommand } from '#structures/WeebCommand';

@ApplyOptions<WeebCommandOptions>({
  description: 'Hug someone',
  embedMessage: '{author} hugged {user} 💖',
})
export default class UserCommand extends WeebCommand {}
