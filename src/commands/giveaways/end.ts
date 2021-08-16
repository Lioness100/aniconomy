import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  aliases: ['giveaway-end', 'gend'],
  description: 'End a giveaway!',
  detailedDescription: [
    'Ends a giveaway.',
    'Accepts the giveaway message ID/URL or prize name as an identifier for the giveaway to end.',
    'If neither of the above are provided, I will default to the last running giveaway.',
  ].join(' '),
  usage: '[giveaway_message_id_or_url | prize]',
  preconditions: [Preconditions.GuildOnly, Preconditions.ModOnly],
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const { giveaways } = this.context.client.giveaways;

    const giveaway =
      (!args.finished &&
        giveaways.find(function (this: string, g) {
          return (
            g.messageURL === this ||
            g.messageID === this ||
            g.prize.toLowerCase() === this.toLowerCase()
          );
        }, await args.rest('string'))) ||
      giveaways[giveaways.length - 1];

    if (!giveaway) {
      throw 'There are no active giveaways!';
    }

    await giveaway.end();
    return message.embed('I ended the giveaway!', true);
  }
}
