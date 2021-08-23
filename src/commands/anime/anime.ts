import type { Message, TextChannel } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { cutText } from '@sapphire/utilities';
import { getColor } from 'colorthief';
import mal from 'mal-scraper';

@ApplyOptions<CommandOptions>({
  description: 'Search for an anime',
  detailedDescription: 'Displays info of an anime through [MyAnimeList](https://myanimelist.net/)',
  usage: '<query>',
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const q = await this.handleArgs(args.rest('string'), 'Please provide a search query');

    const anime = await mal.getInfoFromName(q).catch(() => null);

    if (!anime) {
      throw 'No results were found!';
    }

    if (anime.genres?.includes('Hentai') && !(message.channel as TextChannel).nsfw) {
      throw "You can't look up hentai in a non-NSFW channel!";
    }

    const color = await getColor(anime.picture).catch(() => process.env.COLOR);

    return message.embed(cutText(anime.synopsis || 'No synopsis found...', 550), (embed) => {
      const addField = (name: string, value: unknown, format = value) =>
        value && embed.addField(name, format, true);

      embed
        .setThumbnail(anime.picture)
        .setColor(color)
        .setTitle(cutText(anime.englishTitle || anime.title, 2000))
        .setURL(anime.url);

      addField('❯ Type', anime.type);
      addField('❯ Status', anime.status);
      addField('❯ Trailer', anime.trailer, `🎬 [Play Here!](${anime.trailer})`);
      addField(
        '❯ Score',
        anime.score,
        `${Number(anime.score) < 4 ? '🙁' : Number(anime.score) < 7.5 ? '😐' : '🙂'} ${anime.score}`
      );
      addField('❯ Episodes', anime.episodes, `🎞 ${anime.episodes} Episodes`);
      addField('❯ Source', anime.source);
      addField('❯ Favorites', anime.favorites, `💖 ${anime.favorites} Favorites`);
      addField('❯ Rank', anime.ranked, `⭐ Rank ${anime.ranked}`);
      addField('❯ Rating', anime.rating, `🙈 ${anime.rating}`);
      addField('❯ Genres', anime.genres?.length, anime.genres!.join(', '));
    });
  }
}
