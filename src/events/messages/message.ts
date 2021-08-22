import type { Message } from 'discord.js';
import { EmojiRegex } from '@sapphire/discord.js-utilities';
import { Event, Events } from '@sapphire/framework';
import Levels from '#entities/Levels';

export class UserEvent extends Event<Events.Message> {
  private cooldowns = new Set();

  public async run(message: Message) {
    if (message.author.bot || !message.guild) {
      return;
    }

    const user = await Levels.ensure(message.author.id);
    user.messages++;

    const addXp = async () => {
      if (this.cooldowns.has(message.author.id)) {
        return;
      }

      if (message.content.replace(new RegExp(EmojiRegex.source.slice(1, -1)), ' ').length < 10) {
        return;
      }

      this.cooldowns.add(message.author.id);
      setTimeout(() => this.cooldowns.delete(message.author.id), 30000);

      const hasLeveledUp = await user.addXp(this.context.client, Math.ceil(Math.random() * 50));

      if (hasLeveledUp) {
        return message.channel.send(
          message
            .embed(`You leveled up to ${user.level}! 🎉🎉`)
            .setFooter(`Congrats! You need ${Levels.xpFor(user.level + 1)} to level up again1`)
        );
      }
    };

    await addXp();
    return user.save();
  }
}
