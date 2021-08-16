import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

const items = ['🍒', '🍓', '🍉', '🍌', '🍪', '🍏', '🍎'];

@ApplyOptions<CommandOptions>({
  description: 'Gamble some money in the slot machine',
  detailedDescription: 'Gamble up to $50 in a slot machine!',
  usage: '<bet>',
  preconditions: [Preconditions.GuildOnly],
  cooldown: 120000,
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const bet = await this.handleArgs(
      args.pick('number', { maximum: 50, minimum: 5 }),
      'You must provide a valid bet above 5 and below 50!'
    );

    if (this.context.client.eco.balance.fetch(message.author.id, message.guild!.id) < bet) {
      throw "You don't have enough money in your wallet to make this bet!";
    }

    const numbers = Array.from(
      { length: 3 },
      () => items[Math.floor(Math.random() * items.length)]
    );

    const isAll = numbers[0] === numbers[1] && numbers[1] === numbers[2];
    const isOne =
      numbers[0] === numbers[1] || numbers[1] === numbers[2] || numbers[0] === numbers[2];

    const amount = isAll ? bet * 5 : isOne ? bet * 3 : null;

    const sentMessage = await message.embed('Spinning the slots...', true);
    await new Promise((r) => setTimeout(r, 750, null));

    this.context.client.eco.balance.add(amount || -bet, message.author.id, message.guild!.id);
    return sentMessage.edit(
      sentMessage.embeds[0].setDescription(
        `\`[ ${numbers.join(' - ')} ]\`\nYou ${amount ? `won $${amount}` : `lost $${bet}`}!`
      )
    );
  }
}
