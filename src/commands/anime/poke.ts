import { ApplyOptions } from '@sapphire/decorators';
import type { WeebCommandOptions } from '#structures/WeebCommand';
import { WeebCommand } from '#structures/WeebCommand';

@ApplyOptions<WeebCommandOptions>({
  description: 'Poke someone',
  embedMessage: '{author} poked {user} 👉',
})
export default class UserCommand extends WeebCommand {}
