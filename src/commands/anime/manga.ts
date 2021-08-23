import type { Message, TextChannel } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Jikan } from 'node-myanimelist';
import { getColor } from 'colorthief';
import { cutText } from '@sapphire/utilities';

interface AnimeResult {
  results: [] | [{ mal_id: number }];
}

@ApplyOptions<CommandOptions>({
  description: 'Search for an anime',
  detailedDescription: 'Displays info of an anime through [MyAnimeList](https://myanimelist.net/)',
  usage: '<query>',
  cooldown: 10000,
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const q = await this.handleArgs(args.rest('string'), 'Please provide a search query');

    const res: AnimeResult | 'time' = await new Promise((res) => {
      setTimeout(() => res('time'), 10000);
      Jikan.search()
        .manga({ q, limit: 1 })
        .then(res)
        .catch(() =>
          res({
            results: [],
          })
        );
    });

    if (res === 'time') {
      throw 'MyAnimeList took too long to respond! Please try again.';
    }

    const result = res.results?.[0];
    if (!result?.mal_id) {
      throw 'No results were found!';
    }

    const manga = await Jikan.manga(result.mal_id).info();

    if (
      manga.genres?.some(({ name }) => name === 'Hentai') &&
      !(message.channel as TextChannel).nsfw
    ) {
      throw "You can't look up hentai in a non-NSFW channel!";
    }

    const color = await getColor(manga.image_url).catch(() => process.env.COLOR);

    return message.embed(
      cutText(manga.synopsis || manga.background || 'No synopsis found...', 550),
      (embed) => {
        const addField = (name: string, value: unknown, format = value) =>
          value && embed.addField(name, format, true);

        embed
          .setThumbnail(manga.image_url)
          .setColor(color)
          .setTitle(cutText(manga.title_english || manga.title, 2000))
          .setURL(manga.url);

        addField('❯ Type', manga.type);
        addField('❯ Status', manga.status);
        addField(
          '❯ Authors',
          manga.authors.length,
          manga.authors.map(({ name, url }) => `[${name}](${url} "View Author Page")`).join(', ')
        );
        addField(
          '❯ Score',
          manga.score,
          `${manga.score! < 4 ? '🙁' : manga.score! < 7.5 ? '😐' : '🙂'} ${manga.score}`
        );
        addField('❯ Volumes', manga.volumes, `📚 ${manga.volumes} Volumes`);
        addField('❯ Chapters', manga.chapters, `📖 ${manga.chapters} Chapters`);
        addField('❯ Favorites', manga.favorites, `💖 ${manga.favorites} Favorites`);
        addField('❯ Rank', manga.rank, `⭐ Rank #${manga.rank}`);
        addField(
          '❯ Serializations',
          manga.serializations.length,
          `🎟 ${manga.serializations
            .map(({ name, url }) => `[${name}](${url} "View Serialization Page")`)
            .join(', ')}`
        );
        addField(
          '❯ Genres',
          manga.genres.map(({ name, url }) => `[${name}](${url} "View Genre Page")`).join(', ')
        );
      }
    );
  }
}
