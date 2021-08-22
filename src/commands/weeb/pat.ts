import { ApplyOptions } from '@sapphire/decorators';
import type { WeebCommandOptions } from '#structures/WeebCommand';
import { WeebCommand } from '#structures/WeebCommand';

@ApplyOptions<WeebCommandOptions>({
  aliases: ['headpat'],
  description: 'Pat someone',
  embedMessage: '{author} patted {user}',
})
export default class UserCommand extends WeebCommand {}
