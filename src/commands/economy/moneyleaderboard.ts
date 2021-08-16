import type { Message } from 'discord.js';
import { Permissions } from 'discord.js';
import type { Args } from '@sapphire/framework';
import type Economy from 'discord-economy-super';
import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { chunk } from '@sapphire/utilities';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  aliases: ['mlb'],
  description: 'View the economy leaderboard',
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

  private sendLeaderboard(
    message: Message,
    leaderboard?: ReturnType<Economy['balance']['leaderboard']>
  ) {
    const users =
      leaderboard ?? this.context.client.eco.balance.leaderboard(message.guild!.id).slice(0, 5);
    const display = users
      .map((user) => `**#${user.index}** - <@${user.userID}>\n→ **Wallet:** $${user.money} 💸`)
      .join('\n\n');

    return message.embed(display, { title: `${message.guild!.name} Money Leaderboard` });
  }

  private paginateLeaderboard(message: Message) {
    const users = this.context.client.eco.balance.leaderboard(message.guild!.id);
    if (users.length <= 5) {
      return this.sendLeaderboard(message, users.slice(0, 5));
    }

    const chunks = chunk(users, 5);
    const canRemoveReactions = message.guild!.me!.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES);
    const paginator = new PaginatedMessage({
      actions: PaginatedMessage.defaultActions.slice(1, canRemoveReactions ? undefined : -1),
      pages: chunks.map((users) => {
        const display = users
          .map((user) => `**#${user.index}** - <@${user.userID}>\n→→ **Wallet:** $${user.money} 💸`)
          .join('\n\n');

        const embed = message.embed(display).setTitle(`${message.guild!.name} Money Leaderboard`);
        return () => ({ embed });
      }),
    });

    void paginator.run(message, message.author);
  }
}
