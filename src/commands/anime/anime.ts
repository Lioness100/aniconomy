import type { Message } from 'discord.js';
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

    const anime = await Jikan.anime(result.mal_id).info();
    const color = await getColor(anime.image_url).catch(() => process.env.COLOR);

    return message.embed(
      cutText(anime.synopsis || anime.background || 'No synopsis found...', 550),
      (embed) => {
        const addField = (name: string, value: unknown, format = value) =>
          value && embed.addField(name, format, true);

        embed
          .setThumbnail(anime.image_url)
          .setColor(color)
          .setTitle(cutText(anime.title_english || anime.title, 2000))
          .setURL(anime.url);

        addField('❯ Type', anime.type);
        addField('❯ Status', anime.status);
        addField('❯ Trailer', anime.trailer_url, `🎬 [Play Here!](${anime.trailer_url})`);
        addField(
          '❯ Score',
          anime.score,
          `${anime.score! < 4 ? '🙁' : anime.score! < 7.5 ? '😐' : '🙂'} ${anime.score}`
        );
        addField('❯ Episodes', anime.episodes, `🎞 ${anime.episodes} Episodes`);
        addField('❯ Source', anime.source);
        addField('❯ Favorites', anime.favorites, `💖 ${anime.favorites} Favorites`);
        addField('❯ Rank', anime.rank, `⭐ Rank #${anime.rank}`);
        addField('❯ Rating', anime.rating, `🙈 ${anime.rating}`);
        addField(
          '❯ Genres',
          anime.genres.map(({ name, url }) => `[${name}](${url} "View Genre Page")`).join(', ')
        );
      }
    );
  }
}
