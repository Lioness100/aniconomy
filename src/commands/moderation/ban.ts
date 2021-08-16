import type { Message, TextChannel } from 'discord.js';
import { Permissions } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { MessagePrompter, MessagePrompterStrategies } from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  description: 'Ban a member',
  detailedDescription: [
    "By default, none of the member's messages will be deleted when banned.",
    'To change this, use the `--days=<1-7>` flag yto specify the days worth of messages to delete.',
  ].join(' '),
  quotes: [],
  usage: '<member> [reason] [--days=<1-7>]',
  strategyOptions: {
    options: ['days'],
  },
  preconditions: [Preconditions.GuildOnly, Preconditions.ModOnly],
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    if (!message.member!.hasPermission(Permissions.FLAGS.BAN_MEMBERS)) {
      throw 'You are missing the `Ban Members` permission';
    }

    const member = await this.handleArgs(args.pick('member'), 'Please provide a member to ban');
    const reason = await args.rest('string').catch(() => 'No Reason Provided');
    const days = parseInt(args.getOption('days') as string) || 0;

    if (Number.isNaN(days) || days < 0 || days > 7) {
      throw 'The days option must be a number from 1-7';
    }

    if (message.author.id === member.id) {
      throw "You can't ban yourself";
    }

    if (this.context.client.user!.id === member.id) {
      throw "You can't mute me!";
    }

    if (
      message.member!.roles.highest.position <= member.roles.highest.position &&
      message.author.id !== message.guild!.ownerID
    ) {
      throw "You can't ban someone who's highest role position is equal to or greater than yours";
    }

    if (!member.bannable) {
      throw "This member can't be banned";
    }

    const handler = new MessagePrompter(
      message.embed(`Are you sure you want to ban ${member.user.tag} (${member})`).setColor('RED'),
      MessagePrompterStrategies.Confirm,
      { confirmEmoji: '✅', cancelEmoji: '❌' }
    );

    const hasPermissions = message.guild!.me!.hasPermission('MANAGE_MESSAGES');
    const result = await handler.run(message.channel, message.author).catch(() => {
      const { appliedMessage } = handler.strategy;

      if (hasPermissions) {
        void appliedMessage!.reactions.removeAll();
      }
      void appliedMessage!.edit(message.embed("You didn't react in time!").setColor('RED'));
      return null;
    });

    if (result === null) {
      return;
    }

    const { appliedMessage } = handler.strategy;
    if (hasPermissions) {
      void appliedMessage!.reactions.removeAll();
    }

    if (result) {
      await member.ban({ days, reason });
      void appliedMessage!.edit(message.embed(`${member.user.tag} has been banned`));

      if (process.env.LOG_CHANNEL_ID) {
        const embed = message
          .embed(`${member.user.tag} (${member}) has been banned`)
          .setColor('RED')
          .addField('❯ Reason:', reason)
          .setFooter(`Banned by ${message.author.tag}`, message.author.displayAvatarURL())
          .setTimestamp();

        const channel = message.guild!.channels.cache.get(
          process.env.LOG_CHANNEL_ID
        ) as TextChannel;

        void channel.send(embed).catch(() => null);
      }
    } else {
      await appliedMessage!.edit(message.embed("Ok, I won't ban that member"));
      void appliedMessage!.delete({ timeout: 5000 });
    }
  }
}
