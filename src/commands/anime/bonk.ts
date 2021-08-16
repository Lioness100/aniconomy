import { ApplyOptions } from '@sapphire/decorators';
import type { WeebCommandOptions } from '#structures/WeebCommand';
import { WeebCommand } from '#structures/WeebCommand';

@ApplyOptions<WeebCommandOptions>({
  description: 'Bonk someone',
  embedMessage: '{author} bonked {user}',
})
export default class UserCommand extends WeebCommand {}
