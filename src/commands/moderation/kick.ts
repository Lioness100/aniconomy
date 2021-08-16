import type { Message, TextChannel } from 'discord.js';
import { Permissions } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { MessagePrompter, MessagePrompterStrategies } from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  description: 'Kick a member',
  quotes: [],
  usage: '<member> [reason]',
  preconditions: [Preconditions.GuildOnly, Preconditions.ModOnly],
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    if (!message.member!.hasPermission(Permissions.FLAGS.KICK_MEMBERS)) {
      throw 'You are missing the `Ban Members` permission';
    }

    const member = await this.handleArgs(args.pick('member'), 'Please provide a member to kick');
    const reason = await args.rest('string').catch(() => 'No Reason Provided');

    if (message.author.id === member.id) {
      throw "You can't kick yourself";
    }

    if (this.context.client.user!.id === member.id) {
      throw "You can't mute me!";
    }

    if (
      message.member!.roles.highest.position <= member.roles.highest.position &&
      message.author.id !== message.guild!.ownerID
    ) {
      throw "You can't kick someone who's highest role position is equal to or greater than yours";
    }

    if (!member.kickable) {
      throw "This member can't be kicked";
    }

    const handler = new MessagePrompter(
      message.embed(`Are you sure you want to kick ${member.user.tag} (${member})`).setColor('RED'),
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
      await member.kick(reason);
      void appliedMessage!.edit(message.embed(`${member.user.tag} has been kicked`));

      if (process.env.LOG_CHANNEL_ID) {
        const embed = message
          .embed(`${member.user.tag} (${member}) has been kicked`)
          .setColor('RED')
          .addField('❯ Reason:', reason)
          .setFooter(`Kicked by ${message.author.tag}`, message.author.displayAvatarURL())
          .setTimestamp();

        const channel = message.guild!.channels.cache.get(
          process.env.LOG_CHANNEL_ID
        ) as TextChannel;

        void channel.send(embed).catch(() => null);
      }
    } else {
      await appliedMessage!.edit(message.embed("Ok, I won't kick that member"));
      void appliedMessage!.delete({ timeout: 5000 });
    }
  }
}
