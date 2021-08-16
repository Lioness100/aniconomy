import type { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  description: 'Work at a job!',
  detailedDescription: 'Work and earn some money! Can only be used once an hour.',
  preconditions: [Preconditions.GuildOnly],
})
export class UserCommand extends Command {
  public run(message: Message) {
    const res = this.context.client.eco.rewards.work(message.author.id, message.guild!.id);
    if (!res.status) {
      throw `You're on cooldown! Please try again in \`${res.pretty}\`.`;
    }
    return message.embed(`After working a bit, you earned $${res.reward}!`, true);
  }
}
