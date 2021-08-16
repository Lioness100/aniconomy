import type { Message } from 'discord.js';
import { Permissions } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';
import { chunk } from '@sapphire/utilities';
import Levels, { Levels as LevelsDocument } from '#entities/Levels';

@ApplyOptions<CommandOptions>({
  aliases: ['leaderboard'],
  description: 'View the XP leaderboard',
  detailedDescription: [
    'By default shows the top 5 users. If coupled with the `--paginate` flag,',
    'will show the top 50 in a paginating embed',
  ].join(' '),
  usage: '[--paginate]',
  strategyOptions: {
    flags: ['paginate'],
  },
  preconditions: [Preconditions.GuildOnly],
  permissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
})
export class UserCommand extends Command {
  public run(message: Message, args: Args) {
    return args.getFlags('paginate')
      ? this.paginateLeaderboard(message)
      : this.sendLeaderboard(message);
  }

  private async sendLeaderboard(message: Message, leaderboard?: LevelsDocument[]) {
    const users = leaderboard ?? (await Levels.computeLeaderboard(5));
    const display = users
      .map(
        (user, idx) =>
          `**#${idx + 1}** - <@${user._id}>\n→ **Level:** ${user.level} ⭐\n→ **XP:** ${user.xp} ⭐`
      )
      .join('\n\n');

    return message.embed(display, { title: `${message.guild!.name} Leaderboard` });
  }

  private async paginateLeaderboard(message: Message) {
    const users = await Levels.computeLeaderboard(50);
    if (users.length <= 5) {
      return this.sendLeaderboard(message, users.slice(0, 5));
    }

    const chunks = chunk(users, 5);
    const canRemoveReactions = message.guild!.me!.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES);
    const paginator = new PaginatedMessage({
      actions: PaginatedMessage.defaultActions.slice(1, canRemoveReactions ? undefined : -1),
      pages: chunks.map((users, chunkIdx) => {
        const display = users
          .map(
            (user, idx) =>
              `**#${chunkIdx * 5 + idx + 1}** - <@${user._id}>\n→ **Level:** ${
                user.level
              } ⭐\n→ **XP:** ${user.xp} ⭐`
          )
          .join('\n\n');

        const embed = message.embed(display).setTitle(`${message.guild!.name} Leaderboard`);
        return () => ({ embed });
      }),
    });

    void paginator.run(message, message.author);
  }
}
