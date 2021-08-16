import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  description: 'Buy an item in the shop',
  usage: '<item_name>',
  preconditions: [Preconditions.GuildOnly],
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const item = await this.handleArgs(
      args.rest('string'),
      'Please provide an item to buy (use the `store` command to see the options)'
    );

    const { eco } = this.context.client;
    const found = eco.shop
      .list(message.guild!.id)
      .find(({ itemName }) => itemName.toLowerCase() === item.toLowerCase());
    if (!found) {
      throw 'This is not a valid item!';
    }

    if (eco.balance.fetch(message.author.id, message.guild!.id) < found.price) {
      throw 'You cannot afford this item!';
    }

    eco.shop.buy(found.itemName, message.author.id, message.guild!.id);
    return message.embed(
      `You have bought \`${found.itemName}\`! You now have $${eco.balance.fetch(
        message.author.id,
        message.guild!.id
      )}.\nYou can use the \`inventory\` command to see your currently owned items, or \`use\` to use an item you possess.`,
      true
    );
  }
}
