import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';
import { getColor } from 'colorthief';
import Levels from '#entities/Levels';
import ms from 'ms';

@ApplyOptions<CommandOptions>({
  aliases: ['pro'],
  description: "Shows your, or another member's profile",
  detailedDescription: [
    "Your profile includes how many message you've sent,",
    "the time you've spent in voice channels, when you account was created,",
    'when you joined, and what roles you have',
  ].join(' '),
  usage: '[member]',
  preconditions: [Preconditions.GuildOnly],
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const target = await args.pick('member').catch(() => message.member!);
    const [user, color] = await Promise.all([
      Levels.findById(target.id).lean().select(['voiceTime', 'messages']),
      getColor(target.user.displayAvatarURL({ format: 'png' })).catch(() => process.env.COLOR),
    ]);

    return message.embed('', (embed) => {
      embed
        .setTitle(`${target.user.tag}'s Profile`)
        .addField('❯ Messages', `**${user?.messages ?? 0}** ✉`, true)
        .addField(
          '❯ Voice',
          user?.voiceTime
            ? `**${ms(user?.voiceTime ?? 0, { long: true })}** 🎤`
            : '**0 minutes** 🎤',
          true
        )
        .addField('❯ Created', `<t:${Math.floor(target.user.createdTimestamp / 1000)}>`)
        .addField(
          '❯ Joined',
          target.joinedTimestamp ? `<t:${Math.floor(target.joinedTimestamp / 1000)}>` : 'Unknown'
        )
        .addField(
          '❯ Roles',
          target.roles.cache
            .filter((r) => r.id !== message.guild!.id)
            .map((r) => r.toString())
            .join(', ') || 'You have no roles!'
        )
        .setFooter('For more stats, use `!xp` and `!bal`')
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .setColor(color);
    });
  }
}
