import type { Message, TextChannel } from 'discord.js';
import { Permissions } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  description: 'Locks the current channel temporarily',
  detailedDescription: [
    'When the lockdown is active,',
    'the @everyone role will have the `Send Messages` permission disabled',
  ].join(' '),
  quotes: [],
  usage: '<duration> [reason]',
  preconditions: [Preconditions.GuildOnly, Preconditions.ModOnly],
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    if (!message.member!.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS)) {
      throw 'You are missing the `Manage Channels` permission';
    }

    const duration = await this.handleArgs(
      args.pick('duration'),
      'Please provide a valid duration'
    );

    const reason = await args.rest('string').catch(() => 'No Reason Provided');
    await (message.channel as TextChannel).updateOverwrite(
      message.guild!.roles.everyone,
      {
        SEND_MESSAGES: false,
      },
      reason
    );

    void message.embed(`OK, I'll lock down this channel for now.`, true);

    if (process.env.LOG_CHANNEL_ID) {
      const embed = message
        .embed(`<#${message.channel.id}> has been locked down`)
        .setColor('RED')
        .addField('❯ Reason:', reason)
        .addField('❯ Expiration:', `<t:${Math.floor((Date.now() + duration) / 1000)}:R>`)
        .setFooter(`Locked by ${message.author.tag}`, message.author.displayAvatarURL())
        .setTimestamp();

      const channel = message.guild!.channels.cache.get(process.env.LOG_CHANNEL_ID) as TextChannel;
      void channel.send(embed).catch(() => null);
    }

    const wrap = (fn: () => unknown) => () => void fn();

    setTimeout(
      wrap(async () => {
        await (message.channel as TextChannel).updateOverwrite(
          message.guild!.roles.everyone,
          {
            SEND_MESSAGES: false,
          },
          reason
        );

        if (process.env.LOG_CHANNEL_ID) {
          const embed = message
            .embed(`<#${message.channel.id}>'s lockdown has been lifted`)
            .addField('❯ Original Reason:', reason)
            .setFooter(`Locked by ${message.author.tag}`, message.author.displayAvatarURL())
            .setTimestamp();

          const channel = message.guild!.channels.cache.get(
            process.env.LOG_CHANNEL_ID
          ) as TextChannel;
          void channel.send(embed).catch(() => null);
        }
      }),
      duration
    );
  }
}
