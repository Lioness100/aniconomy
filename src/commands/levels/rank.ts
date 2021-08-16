import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';
import Levels from '#entities/Levels';

@ApplyOptions<CommandOptions>({
  aliases: ['level', 'xp', 'position'],
  description: "Shows your, or another user's rank",
  usage: '[user]',
  preconditions: [Preconditions.GuildOnly],
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const target = await args.pick('user').catch(() => message.author);
    const isMe = target.id === message.author.id;

    const user = await Levels.findById(target.id);
    if (!user?.xp) {
      throw `${isMe ? 'You have' : `<@${target.id}> has`} no xp!`;
    }

    const leaderboard = await Levels.find({
      xp: { $gt: 0 },
    })
      .select([])
      .sort([['xp', 'descending']])
      .lean();

    const position = leaderboard.findIndex((i) => i._id === target.id) + 1;
    return message.embed('', (embed) => {
      embed
        .setTitle(`${target.tag}'s Stats`)
        .addField('❯ XP', `**${user.xp}** ⭐`, true)
        .addField('❯ Level', `**${user.level}** ⭐`, true)
        .addField('❯ Rank', `**Position #${position}**`);
    });
  }
}
