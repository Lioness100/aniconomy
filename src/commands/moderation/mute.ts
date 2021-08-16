import type { Message, TextChannel } from 'discord.js';
import { Permissions } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  description: 'Mute a member temporarily',
  detailedDescription: [
    'This command will attempt to find a role called "Muted" and assign it to the member.',
    "If a role isn't found, it will be created (with `Send Messages` and `Add Reactions` disabled in every channel",
  ].join(' '),
  quotes: [],
  usage: '<member> <duration> [reason]',
  preconditions: [Preconditions.GuildOnly, Preconditions.ModOnly],
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    if (!message.member!.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
      throw 'You are missing the `Manage Roles` permission';
    }

    const member = await this.handleArgs(args.pick('member'), 'Please provide a member to mute');

    if (message.author.id === member.id) {
      throw "You can't mute yourself";
    }

    if (this.context.client.user!.id === member.id) {
      throw "You can't mute me!";
    }

    if (
      message.member!.roles.highest.position <= member.roles.highest.position &&
      message.author.id !== message.guild!.ownerID
    ) {
      throw "You can't mute someone who's highest role position is equal to or greater than yours";
    }

    if (!member.manageable) {
      throw "This member can't be banned";
    }

    const duration = await this.handleArgs(
      args.pick('duration'),
      'Please provide a valid duration'
    );

    const reason = await args.rest('string').catch(() => 'No Reason Provided');
    let role = message.guild!.roles.cache.find(({ name }) => name === 'Muted')!;
    if (!role) {
      role = await message.guild!.roles.create({
        data: {
          name: 'Muted',
          position: message.guild!.me!.roles.highest.position - 1,
        },
      });

      for (const channel of message
        .guild!.channels.cache.filter(({ type }) => type === 'text')
        .values()) {
        await channel.updateOverwrite(role, { SEND_MESSAGES: false, ADD_REACTIONS: false });
      }
    }

    await member.roles.add(role);
    void message.embed(`OK, I muted ${member.user.tag}`, true);

    if (process.env.LOG_CHANNEL_ID) {
      const embed = message
        .embed(`${member.user.tag} (${member}) has been muted`)
        .setColor('RED')
        .addField('❯ Reason:', reason)
        .addField('❯ Expiration:', `<t:${Math.floor((Date.now() + duration) / 1000)}:R>`)
        .setFooter(`Muted by ${message.author.tag}`, message.author.displayAvatarURL())
        .setTimestamp();

      const channel = message.guild!.channels.cache.get(process.env.LOG_CHANNEL_ID) as TextChannel;
      void channel.send(embed).catch(() => null);
    }

    setTimeout(() => {
      member.roles.remove(role).catch(() => null);
      if (process.env.LOG_CHANNEL_ID) {
        const embed = message
          .embed(`${member.user.tag} (${member}) has been unmuted`)
          .addField('❯ Original Reason:', reason)
          .setFooter(`Muted by ${message.author.tag}`, message.author.displayAvatarURL())
          .setTimestamp();

        const channel = message.guild!.channels.cache.get(
          process.env.LOG_CHANNEL_ID
        ) as TextChannel;
        void channel.send(embed).catch(() => null);
      }
    }, duration);
  }
}
