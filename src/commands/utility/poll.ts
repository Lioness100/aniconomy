import type { Message, MessageReaction, TextChannel, Snowflake } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { MessagePrompterStrategies, MessagePrompter } from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';
import { Collection } from 'discord.js';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Preconditions } from '#types/Enums';

@ApplyOptions<CommandOptions>({
  description: 'Create a poll with up to 26 options',
  detailedDescription: [
    `After this command is executed, a prompt will appear to guide your through the process.`,
    'If you use the `-a` or `--anonymous` flag,',
    "then members's reactions will be removed immediately (although still counted).",
    '\n\nOptions **must** be surrounded with double quotes.',
    'The first portion of text will be the question. Example:',
    '```\n!poll 24h "What is your favorite color?" "Blue" "Green" "Red"\n```',
  ].join(' '),
  strategyOptions: { flags: ['a', 'anonymous'] },
  usage: '<duration> <question> <options> [-a | --anonymous]',
  preconditions: [Preconditions.GuildOnly, Preconditions.ModOnly],
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const duration = await this.handleArgs(
      args.pick('duration'),
      'Please provide a valid duration for the poll!'
    );

    const question = await this.handleArgs(
      args.pick('string'),
      'Please provide a valid poll question!'
    );

    const options = await this.handleArgs(
      args.repeat('string'),
      'Please provide at least 2 options'
    );

    if (options.length < 2) {
      throw 'Please provide at least 2 options';
    }

    if (options.length > 26) {
      throw "There can't be more than 26 options";
    }

    const handler = new MessagePrompter(
      message.embed(
        `Please react **in order** to link an option to an emoji. When you're done, reply with any message. You can only use default emojis, or emojis within this guild.\n\n**Options:**\n${options
          .map((option, idx) => `**${idx + 1}** - ${option}`)
          .join('\n')}`
      ),
      MessagePrompterStrategies.Message,
      { timeout: 600000 }
    );

    const result = await handler.run(message.channel, message.author).catch(() => {
      const { appliedMessage } = handler.strategy;
      void appliedMessage!.edit(
        message.embed("You didn't finish in time! Try again.").setColor('RED')
      );
      return null;
    });

    if (result === null) {
      return;
    }

    const reactions = handler.strategy
      .appliedMessage!.reactions.cache.filter((reaction) =>
        reaction.users.cache.has(message.author.id)
      )
      .array();

    if (reactions.length < options.length) {
      throw `You only supplied ${reactions.length} emojis, although there was ${options.length} options!`;
    }

    const count = new Collection<string, { count: number; option: string; users: Set<Snowflake> }>(
      reactions.map(({ emoji }, idx) => [
        emoji.toString(),
        { count: 0, option: options[idx], users: new Set<Snowflake>() },
      ])
    );

    const anon = args.getFlags('a', 'anonymous');
    const deadline = Math.floor((Date.now() + duration) / 1000);
    const embed = (end = false) =>
      message
        .embed(
          `${question}\n\n**Options:**\n${count
            .map(({ count, option }, emoji) => `${emoji} - ${option} - **${count} Votes**`)
            .join('\n')}\n\n**Deadline:**\n${end ? 'This poll has ended!' : `<t:${deadline}:R>`}${
            anon ? '\n\n*Your vote is anonymous*' : ''
          }`
        )
        .setTitle('Poll!');

    const pollChannel = message.guild!.channels.cache.get(
      process.env.POLL_CHANNEL_ID
    ) as TextChannel;
    const sentMessage = await pollChannel.send(embed());

    for (const reaction of reactions) {
      await sentMessage.react(reaction.emoji);
    }

    const collector = sentMessage.createReactionCollector(
      (reaction: MessageReaction) =>
        reactions.some(({ emoji }) => emoji.identifier === reaction.emoji.identifier),
      { time: duration, dispose: true }
    );

    const inc = (reaction: MessageReaction, amount: number, user: Snowflake) => {
      const curr = count.get(reaction.emoji.toString())!;
      curr.count += amount;

      amount === 1 ? curr.users.add(user) : curr.users.delete(user);
      count.set(reaction.emoji.toString(), curr);
    };

    const removalCache = new Set<Snowflake>();
    collector.on('collect', (reaction, user) => {
      if (anon) {
        removalCache.add(user.id);
        void reaction.users.remove(user);
      }

      const last = count.findKey(({ users }) => users.has(user.id));
      if (last) {
        if (last === reaction.emoji.toString()) {
          return collector.emit('remove', reaction, user);
        }

        const lastReaction = sentMessage.reactions.cache.find(
          ({ emoji }) => emoji.toString() === last
        )!;

        inc(lastReaction, -1, user.id);
        removalCache.add(user.id);
        void lastReaction.users.remove(user);
      }

      inc(reaction, 1, user.id);
      void sentMessage.edit(embed());
    });

    collector.on('remove', (reaction, user) => {
      if (removalCache.has(user.id)) {
        return removalCache.delete(user.id);
      }

      inc(reaction, -1, user.id);
      void sentMessage.edit(embed());
    });

    collector.once('end', () => {
      void sentMessage.edit(embed(true));
      void pollChannel.send(
        message
          .embed(
            `${question}\n\n**Final Results:**\n${count
              .map(({ count, option }, emoji) => `${emoji} - ${option} - **${count} Votes**`)
              .join('\n')}`
          )
          .setTitle('Poll Ended')
      );
    });

    return message.embed(`OK, poll created in <#${process.env.POLL_CHANNEL_ID}>`, true);
  }
}
