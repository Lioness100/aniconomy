import type { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  description: 'View the items in your inventory',
  preconditions: [Preconditions.GuildOnly],
})
export class UserCommand extends Command {
  public run(message: Message) {
    const inventory = this.context.client.eco.shop.inventory(message.author.id, message.guild!.id);
    if (!inventory.length) {
      throw "You don't own any items!";
    }

    return message.embed(
      inventory
        .map(
          ({ itemName, price, date }) =>
            `\`${itemName}\`\n→ **Price:** $${price} 💸\n→ **Date Bought**: <t:${
              Date.parse(
                date.replace(/(\d{2})\.(\d{2})\.(\d{4})/, (_match, ...args) =>
                  args.slice(0, 3).reverse().join('/')
                )
              ) / 1000
            }>`
        )
        .join('\n\n'),
      (embed) => {
        embed.setTitle(`Your Inventory`).setFooter('Use any item with the `use` command');
      }
    );
  }
}
