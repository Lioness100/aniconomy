import { ApplyOptions } from '@sapphire/decorators';
import type { WeebCommandOptions } from '#structures/WeebCommand';
import { WeebCommand } from '#structures/WeebCommand';

@ApplyOptions<WeebCommandOptions>({
  description: 'Bite someone',
  embedMessage: '{author} bit {user}',
})
export default class UserCommand extends WeebCommand {}
