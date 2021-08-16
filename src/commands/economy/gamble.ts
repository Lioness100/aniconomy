import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  description: 'Gamble some money',
  detailedDescription: [
    'Gamble up to $50 in a coin flip!',
    "You may specify which side of the coin you're betting on, but it will default to `heads`",
  ].join(' '),
  usage: '<bet> [heads | tails]',
  preconditions: [Preconditions.GuildOnly],
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

    const coinSide = (await args.pick('string').catch(() => 'heads')).toLowerCase();

    if (!['heads', 'tails'].includes(coinSide)) {
      throw 'Your bet must be `heads` or `tails`!';
    }

    const sentMessage = await message.embed('Flipping the coin...', true);
    await new Promise((r) => setTimeout(r, 750, null));

    const heads = Math.random() > 0.5;
    const won = heads && coinSide === 'heads';
    this.context.client.eco.balance.add(won ? bet : -bet, message.author.id, message.guild!.id);

    return sentMessage.edit(
      sentMessage.embeds[0].setDescription(
        `The coin landed on... ${heads ? 'heads' : 'tails'}! You ${won ? 'won' : 'lost'} $${bet}!`
      )
    );
  }
}
