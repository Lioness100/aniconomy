import type { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { MessagePrompter, MessagePrompterStrategies } from '@sapphire/discord.js-utilities';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';
import Levels from '#entities/Levels';

@ApplyOptions<CommandOptions>({
  description: 'Wipe all leveling data',
  preconditions: [Preconditions.GuildOnly, Preconditions.ModOnly],
  permissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
})
export class UserCommand extends Command {
  public async run(message: Message) {
    const handler = new MessagePrompter(
      message
        .embed('Are you sure you want to do this? This action is irreversible.')
        .setColor('RED'),
      MessagePrompterStrategies.Confirm,
      { confirmEmoji: '✅', cancelEmoji: '❌' }
    );

    const hasPermissions = message.guild!.me!.hasPermission('MANAGE_MESSAGES');
    const result = await handler.run(message.channel, message.author).catch(() => {
      const { appliedMessage } = handler.strategy;

      if (hasPermissions) {
        void appliedMessage!.reactions.removeAll();
      }
      void appliedMessage!.edit(message.embed("You didn't react in time!").setColor('RED'));
      return null;
    });

    if (result === null) {
      return;
    }

    const { appliedMessage } = handler.strategy;
    if (hasPermissions) {
      void appliedMessage!.reactions.removeAll();
    }

    if (result) {
      const { nModified } = await Levels.updateMany({ xp: { $gt: 0 } }, { $set: { xp: 0 } });
      return appliedMessage!.edit(
        message.embed(
          `Alright, ${nModified} ${nModified === 1 ? 'person' : 'people'}'s XP has been reset!`
        )
      );
    }

    return appliedMessage!.edit(message.embed("Alright, everyone's levels will stay the same"));
  }
}
