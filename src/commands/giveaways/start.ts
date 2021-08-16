import type { Message, TextChannel } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';
import Levels from '#entities/Levels';

@ApplyOptions<CommandOptions>({
  aliases: ['giveaway-start', 'gstart'],
  description: 'Start a giveaway!',
  detailedDescription: [
    'Starts a giveaway, accepting a the prize as the first argument, and the duration as the second.',
    'The duration format should be a number followed by the time measure (ex: 20m, 3.5h).',
    "\n\nIf you'd like to set a level requirement, use the `--level` flag.",
    "If you'd like to award more than one winner, use the `--winners` flag",
  ].join(' '),
  quotes: [],
  usage: '<duration> <prize> [--level=<number>] [--winners=<number>]',
  strategyOptions: { options: ['winners', 'level'] },
  preconditions: [Preconditions.GuildOnly, Preconditions.ModOnly],
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const duration = await this.handleArgs(
      args.pick('duration'),
      'Please provide a valid duration!'
    );

    const prize = await this.handleArgs(args.rest('string'), 'Please provide a valid prize!');
    const level = args.getOption('level');
    const winners = args.getOption('winners');

    if (level && Number.isNaN(+level)) {
      throw `"${level}" is not a valid number!`;
    }

    if (winners && Number.isNaN(+winners)) {
      throw `"${winners}" is not a valid number!`;
    }

    const giveawayChannel = message.guild!.channels.cache.get(
      process.env.GIVEAWAY_CHANNEL_ID
    ) as TextChannel;

    if (!giveawayChannel) {
      throw 'The `GIVEAWAY_CHANNEL_ID` in my config is invalid...';
    }

    if (giveawayChannel.type !== 'text') {
      throw 'The `GIVEAWAY_CHANNEL_ID` in my config does not refer to a text channel';
    }

    await this.context.client.giveaways.start(giveawayChannel, {
      hostedBy: message.author,
      prize,
      time: duration,
      winnerCount: parseInt(winners!) || 1,
      messages: {
        giveaway: `<@&${process.env.GIVEAWAY_ROLE_ID}>\n🎉🎉 **GIVEAWAY!** 🎉🎉`,
        giveawayEnded: `<@&${process.env.GIVEAWAY_ROLE_ID}>\n**Giveaway Ended**`,
        embedFooter: 'Enter Now!',
        hostedBy: `Hosted by: {user}${
          level ? `\n\n**You must be at least level ${parseInt(level)} to enter!**` : ''
        }`,
      },
      exemptMembers: async (member) => {
        if (!member || !level) {
          return false;
        }

        const user = await Levels.findById(member.id);
        return user ? user.level < parseInt(level) : true;
      },
    });

    return message.embed(`The giveaway has started in <#${giveawayChannel.id}>!`, true);
  }
}
