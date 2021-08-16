import type { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  aliases: ['balance', 'money'],
  description: 'Check your balance',
  preconditions: [Preconditions.GuildOnly],
})
export class UserCommand extends Command {
  public run(message: Message) {
    const wallet = this.context.client.eco.balance.fetch(message.author.id, message.guild!.id);
    return message.embed(`Displaying ${message.author.tag}'s balance:`, (embed) => {
      embed.addField('❯ Wallet', `$${wallet} 💸`);
    });
  }
}
