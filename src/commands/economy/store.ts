import type { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  aliases: ['shop'],
  description: 'View the items in the shop',
  preconditions: [Preconditions.GuildOnly],
})
export class UserCommand extends Command {
  public run(message: Message) {
    return message.embed(
      this.context.client.eco.shop
        .list(message.guild!.id)
        .map(({ itemName, price }) => `\`${itemName}\`\n→ **Price:** $${price} 💸`)
        .join('\n\n'),
      (embed) => {
        embed
          .setTitle(`${message.guild!.name}'s Store`)
          .setFooter('Buy any item with the `buy` command');
      }
    );
  }
}
