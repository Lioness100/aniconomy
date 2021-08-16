import type { Message, TextChannel } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';
import Levels from '#entities/Levels';

const options = ['winners', 'level', 'invites'];

@ApplyOptions<CommandOptions>({
  aliases: ['giveaway-start', 'gstart'],
  description: 'Start a giveaway!',
  detailedDescription: [
    'Starts a giveaway, accepting a the prize as the first argument, and the duration as the second.',
    'The duration format should be a number followed by the time measure (ex: 20m, 3.5h).',
    "\n\nIf you'd like to set a level requirement, use the `--level` flag.",
    "\nIf you'd like to set an invites requirement, use the `--invites` flag.",
    "\nIf you'd like to award more than one winner, use the `--winners` flag",
  ].join(' '),
  quotes: [],
  usage: '<duration> <prize> [--level=<number>] [--invites=<number>] [--winners=<number>]',
  strategyOptions: { options },
  preconditions: [Preconditions.GuildOnly, Preconditions.ModOnly],
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const duration = await this.handleArgs(
      args.pick('duration'),
      'Please provide a valid duration!'
    );

    const prize = await this.handleArgs(args.rest('string'), 'Please provide a valid prize!');
    const [winners, level, invites] = options.map((option) => {
      const value = args.getOption(option);
      if (value && Number.isNaN(+value)) {
        throw `"${level}" is not a valid number!`;
      }

      return value;
    });

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
          level && invites
            ? `\n${level ? `\n**You must be at least level ${parseInt(level)} to enter!**` : ''}${
                invites
                  ? `\n**You must have invited at least ${parseInt(
                      invites
                    )} people to enter (use \`!invites\` to check)**`
                  : ''
              }`
            : ''
        }`,
      },
      exemptMembers: async (member) => {
        if (!member || !(level && invites)) {
          return false;
        }

        if (level) {
          const user = await Levels.findById(member.id).select(['level']).lean();
          if (!user || user.level < parseInt(level)) {
            return true;
          }
        }

        if (invites) {
          const { size } = this.context.client.invites.invitesCache
            .first()!
            .filter(({ inviter }) => inviter?.id === message.author.id);

          if (size < parseInt(invites)) {
            return true;
          }
        }

        return false;
      },
    });

    return message.embed(`The giveaway has started in <#${giveawayChannel.id}>!`, true);
  }
}
