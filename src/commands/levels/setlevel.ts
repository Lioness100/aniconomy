import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';
import Levels from '#entities/Levels';

@ApplyOptions<CommandOptions>({
  description: "Manually sets a user's level",
  usage: '<user> <level>',
  preconditions: [Preconditions.GuildOnly, Preconditions.ModOnly],
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const target = await this.handleArgs(args.pick('user'), 'Please provide a user!');
    const level = await this.handleArgs(args.pick('number'), 'Please provide a level to set!');

    const user = await Levels.ensure(target.id);
    await user.addXp(this.context.client, Levels.xpFor(level) - user.xp);
    await user.save();

    return message.embed(`OK, <@${user.id}>'s level has been set to ${level}`, true);
  }
}
