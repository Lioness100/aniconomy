import type { Message, TextChannel } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  description: 'Announce something!',
  detailedDescription: [
    `Reposts your messages in an embed placed in <#${process.env.ANNOUNCEMENT_CHANNEL_ID}>.`,
    'For parsing purposes, quotes will be removed in the announcement message.',
    '\n\nTo set the embed title, use the `--title="this is a title"` flag',
  ].join(' '),
  strategyOptions: { options: ['title'] },
  usage: '<message> [--title="title"]',
  preconditions: [Preconditions.GuildOnly, Preconditions.ModOnly],
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const announcement = await this.handleArgs(
      args.rest('string'),
      'Please provide an announcement to send!'
    );

    const channel = message.guild!.channels.cache.get(
      process.env.ANNOUNCEMENT_CHANNEL_ID
    ) as TextChannel;

    if (!channel) {
      throw 'The `ANNOUNCEMENT_CHANNEL_ID` in my config is invalid...';
    }

    if (channel.type !== 'text') {
      throw 'The `ANNOUNCEMENT_CHANNEL_ID` in my config does not refer to a text channel';
    }

    return channel.send(`<@&${process.env.ANNOUNCEMENT_ROLE_ID}>`, {
      embed: message.embed(announcement).setTitle(args.getOption('title') ?? 'Announcement!'),
    });
  }
}
