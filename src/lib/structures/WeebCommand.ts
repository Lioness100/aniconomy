import type { PieceContext, Args } from '@sapphire/framework';
import type { Message } from 'discord.js';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';
import { fetch } from '@sapphire/fetch';

export abstract class WeebCommand extends Command {
  private embedMessage?: string;

  public constructor(context: PieceContext, options: WeebCommandOptions) {
    super(context, { usage: '[user]', preconditions: [Preconditions.GuildOnly], ...options });
    this.embedMessage = options.embedMessage;
  }

  public async run(message: Message, args: Args) {
    const { url } = await fetch<{ url: string }>(`https://waifu.pics/api/sfw/${this.name}`);
    const member = this.embedMessage ? await args.rest('member').catch(() => null) : null;
    if (member?.id === message.author.id) {
      throw `You can't ${this.name} yourself >:(`;
    }

    const title =
      member &&
      this.embedMessage
        ?.replace('{user}', member.displayName)
        .replace('{author}', message.member!.displayName);

    return message.embed('', (embed) =>
      embed
        .setColor('RANDOM')
        .setImage(url)
        .setTitle(title ?? '')
    );
  }
}

export interface WeebCommandOptions extends CommandOptions {
  embedMessage?: string;
}
