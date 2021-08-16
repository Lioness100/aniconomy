import type { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';

@ApplyOptions<CommandOptions>({
  description: "List the number of people you've invited",
})
export class UserCommand extends Command {
  public run(message: Message) {
    return message.embed(
      `You\'ve invited ${
        this.context.client.invites.invitesCache
          .first()!
          .filter(({ inviter }) => inviter?.id === message.author.id).size
      } people that I can detect!`,
      true
    );
  }
}
