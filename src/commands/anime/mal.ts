import type { MalUrl } from 'node-myanimelist/typings/methods/jikan/types/common';
import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Jikan } from 'node-myanimelist';
import { getColor } from 'colorthief';
import { millify } from 'millify';

interface User {
  username: string;
  url: string;
  image_url: string;
  last_online: string;
  joined: string;
  anime_stats: {
    days_watched: number;
    watching: number;
    completed: number;
    episodes_watched: number;
  };
  manga_stats: {
    days_read: number;
    reading: number;
    completed: number;
    volumes_read: number;
    chapters_read: number;
  };
  favorites: {
    anime: MalUrl[];
    manga: MalUrl[];
  };
}

@ApplyOptions<CommandOptions>({
  description: 'Display a MyAnimeList account',
  usage: '<query>',
  cooldown: 10000,
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const q = await this.handleArgs(args.rest('string'), 'Please provide a search query');

    const user: User | 'time' = await new Promise((res) => {
      setTimeout(() => res('time'), 10000);
      Jikan.user(q)
        .profile()
        .then(res)
        .catch(() => null);
    });

    if (user === 'time') {
      throw 'MyAnimeList took too long to respond! Please try again.';
    }

    if (!user) {
      throw `A user by the name of \`${q}\` was not found!`;
    }

    const color = user.image_url
      ? await getColor(user.image_url).catch(() => process.env.COLOR)
      : process.env.COLOR;

    return message.embed('', (embed) => {
      const addField = (name: string, value: unknown, format = value, inline = true) =>
        value && embed.addField(name, format, inline);

      embed.setThumbnail(user.image_url).setColor(color).setTitle(user.username).setURL(user.url);

      addField('❯ Last Online', `<t:${Math.floor(Date.parse(user.last_online) / 1000)}:R>`);
      addField('❯ Account Created', `<t:${Math.floor(Date.parse(user.joined) / 1000)}:R>`);
      addField(
        '❯ Anime Stats',
        `→ Days Watched: **${millify(
          user.anime_stats.days_watched
        )}**\n→ Episodes Watched: **${millify(
          user.anime_stats.episodes_watched
        )}**\n→ Watching: **${millify(user.anime_stats.watching)}**\n→ Completed: **${millify(
          user.anime_stats.completed
        )}**`,
        undefined,
        false
      );

      addField(
        '❯ Manga Stats',
        `→ Days Read: **${millify(user.manga_stats.days_read)}**\n→ Volumes Read: **${millify(
          user.manga_stats.volumes_read
        )}**\n→ Chapters Read: **${millify(
          user.manga_stats.chapters_read
        )}**\n→ Reading: **${millify(user.manga_stats.reading)}**\n→ Completed: **${millify(
          user.manga_stats.completed
        )}**`,
        undefined,
        false
      );

      const anime = user.favorites.anime
        .slice(0, 3)
        .map((entry) => `[${entry.name}](${entry.url})`)
        .join(', ');
      const manga = user.favorites.manga
        .slice(0, 3)
        .map((entry) => `[${entry.name}](${entry.url})`)
        .join(', ');

      addField(
        '❯ Favorites',
        anime.length || manga.length,
        `${anime.length ? `→ Anime: ${anime}${manga.length ? '\n' : ''}` : ''}${
          manga.length ? `→ Manga: ${manga}` : ''
        }`
      );
    });
  }
}
