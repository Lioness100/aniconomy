import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Jikan } from 'node-myanimelist';
import { toTitleCase, chunk } from '@sapphire/utilities';

interface TopEntry {
  rank: number;
  score: number;
  title: string;
  url: string;
  type: string;
  episodes?: number;
  volumes?: number;
}

interface TopResult {
  top: TopEntry[];
}

const animeSubtypes = ['airing', 'upcoming', 'tv', 'movie', 'ova', 'special'];
const mangaSubtypes = ['novels', 'oneshots', 'manwa', 'manhua'];

@ApplyOptions<CommandOptions>({
  description: 'Shows top anime or manga',
  detailedDescription: 'Shows the top 50 anime or manga of MyAnimeList based on various filters',
  usage: `<anime [${animeSubtypes.join(' | ')}] | manga [${mangaSubtypes.join(' | ')}]>`,
  cooldown: 1000,
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const type = await this.handleArgs(
      args.pick('string'),
      'Please provide a media type (anime / manga)'
    );

    if (!['anime', 'manga'].includes(type.toLowerCase())) {
      throw '`type` must be `anime` or `manga`';
    }

    const subtype = await args.pick('string').catch(() => null);
    if (subtype) {
      if (type.toLowerCase() === 'anime' && !animeSubtypes.includes(subtype.toLowerCase())) {
        throw `If \`type\` is \`anime\`, \`subtype\` must be one of: ${animeSubtypes.join(', ')}`;
      } else if (type.toLowerCase() === 'manga' && !mangaSubtypes.includes(subtype.toLowerCase())) {
        throw `If \`type\` is \`manga\`, \`subtype\` must be one of: ${animeSubtypes.join(', ')}`;
      }
    }

    type Top = Record<string, () => Record<string, () => Promise<TopResult>>>;
    const { top } = await (Jikan.top() as unknown as Top)
      [type.toLowerCase()]()
      [subtype?.toLowerCase() ?? 'all']();

    const chunks = chunk(top, 5);
    const paginator = new PaginatedMessage({
      actions: PaginatedMessage.defaultActions.slice(1),
      pages: chunks.map((entries) => {
        const display = entries
          .map(
            (entry) =>
              `**#${entry.rank}** - [${entry.title}](${entry.url})${
                subtype ? '' : `\n→ **Type:** ${entry.type} 🌀`
              }\n→ **Score:** ${entry.score} ⭐${
                entry.volumes
                  ? `\n→ **Volumes:** ${entry.volumes} 📚`
                  : entry.episodes
                  ? `\n→ **Episodes:** ${entry.episodes} 🎞`
                  : ''
              }`
          )
          .join('\n\n');

        const embed = message
          .embed(display)
          .setTitle(
            `Top ${toTitleCase(type.toLowerCase())}${
              subtype ? ` (${toTitleCase(subtype.toLowerCase())})` : ''
            }`
          );
        return () => ({ embed });
      }),
    });

    void paginator.run(message, message.author);
  }
}
