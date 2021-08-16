import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';
import blackjack from 'discord-blackjack';

@ApplyOptions<CommandOptions>({
  description: 'Gamble some money in blackjack',
  detailedDescription: 'Gamble up to $50 in a game of blackjack!',
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

    const { result, ycontent, yvalue, dcontent, dvalue } = await blackjack(
      message,
      this.context.client,
      { resultEmbed: false }
    );

    const results = new Map<typeof result, { amount?: number; desc: string; color?: string }>([
      ['Cancel', { desc: 'The match has been canceled', color: 'YELLOW' }],
      ['Double Lose', { desc: 'You lost', amount: -bet * 2, color: 'RED' }],
      ['Double Win', { desc: 'You won', amount: bet * 2 }],
      ['ERROR', { desc: 'Something went wrong!', color: 'RED' }],
      ['Lose', { desc: 'You lost', amount: -bet, color: 'RED' }],
      ['Tie', { desc: 'The match ended in a tie!', color: 'YELLOW' }],
      ['Timeout', { desc: "You didn't respons in time!", color: 'YELLOW' }],
      ['Win', { desc: 'You won', amount: bet }],
    ]);

    if (typeof result !== 'string') {
      return;
    }

    const { desc, amount, color } = results.get(result) || results.get('ERROR')!;
    if (amount) {
      this.context.client.eco.balance.add(amount, message.author.id, message.guild!.id);
    }

    return message.embed(amount ? `${desc} $${Math.abs(amount)}!` : desc, (embed) => {
      embed.addFields([
        {
          name: 'Your Hand',
          value: `Cards: ${ycontent}\nTotal: \`${yvalue}\``,
          inline: true,
        },
        {
          name: 'My Hand',
          value: `Cards: ${dcontent}\nTotal: \`${dvalue}\``,
          inline: true,
        },
      ]);

      if (color) {
        embed.setColor(color);
      }
    });
  }
}
