import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  aliases: ['inv'],
  description: 'Use an item from your inventory',
  usage: '<item_name>',
  preconditions: [Preconditions.GuildOnly],
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const item = await this.handleArgs(
      args.rest('string'),
      'Please provide an item to use (use the `inventory` command to see the options)'
    );

    const { eco } = this.context.client;
    const found = eco.shop
      .inventory(message.author.id, message.guild!.id)
      .findIndex(({ itemName }) => itemName.toLowerCase() === item.toLowerCase());
    const name = eco.shop.inventory(message.author.id, message.guild!.id)[found];
    if (found === -1) {
      throw 'You do not have this item!';
    }

    // @ts-ignore bad typings
    eco.database.removeElement(`${message.guild!.id}.${message.author.id}.inventory`, found);
    return message.channel.send(
      `<@${process.env.OWNER_ID}>`,
      message.embed(
        `You have used the item \`${name.itemName}\`! Please wait for <@${process.env.OWNER_ID}> to arrive and deliver the benefits 🎉🎉`
      )
    );
  }
}
