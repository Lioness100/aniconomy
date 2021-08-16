import type { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';
import ms from 'ms';

@ApplyOptions<CommandOptions>({
  description: 'Collect your monthly income',
  preconditions: [Preconditions.GuildOnly],
})
export class UserCommand extends Command {
  public run(message: Message) {
    const { eco } = this.context.client;
    const userCooldown = eco.database.fetch(
      `${message.guild!.id}.${message.author.id}.monthlyCooldown`
    );

    const month = 2628002880;
    const cooldownEnd = month - (Date.now() - userCooldown);

    if (userCooldown !== null && cooldownEnd > 0) {
      throw `You're on cooldown! Please try again in \`${ms(cooldownEnd)}\`.`;
    }

    eco.balance.add(2000, message.author.id, message.guild!.id);
    eco.database.set(`${message.guild!.id}.${message.author.id}.monthlyCooldown`, Date.now());

    return message.embed(`You earned $2000!`, true);
  }
}
