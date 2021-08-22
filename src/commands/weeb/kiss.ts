import { ApplyOptions } from '@sapphire/decorators';
import type { WeebCommandOptions } from '#structures/WeebCommand';
import { WeebCommand } from '#structures/WeebCommand';

@ApplyOptions<WeebCommandOptions>({
  description: 'Kiss someone',
  embedMessage: '{author} kissed {user} 💖',
})
export default class UserCommand extends WeebCommand {}
