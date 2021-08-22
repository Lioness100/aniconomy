import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '#structures/Command';
import { Command } from '#structures/Command';
import { Jikan } from 'node-myanimelist';
import { toTitleCase } from '@sapphire/utilities';

const days = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

interface AnimeEntry {
  title: string;
  url: string;
  airing_start: string;
}

type Schedule = Record<typeof days[number], AnimeEntry[]>;

@ApplyOptions<CommandOptions>({
  description: "Show this week's anime schedule",
  detailedDescription:
    'Displays an anime airing on every day of the week (or 10 if you specify a specifc day)',
  usage: `[${days.join(' | ')}]`,
  cooldown: 10000,
})
export class UserCommand extends Command {
  public async run(message: Message, args: Args) {
    const day = await args.pick('string').catch(() => null);
    if (day && !days.includes(day.toLowerCase() as typeof days[number])) {
      throw `\`day\` should be one of: ${days.join(', ')}`;
    }

    const schedule = await (Jikan.schedule() as unknown as Record<string, () => Promise<Schedule>>)[
      day?.toLowerCase() ?? 'all'
    ]();

    if (day) {
      const daySchedule = schedule[day.toLowerCase() as typeof days[number]];
      return message.embed(
        `[UTC Timezone Difference](https://www.timeanddate.com/time/difference/timezone/utc)\n\n${daySchedule
          .slice(0, 10)
          .map(({ title, url, airing_start }) => {
            const date = new Date(airing_start);
            const minutes = date.getUTCMinutes();
            let hour = date.getUTCHours();
            let base = 'AM';

            if (hour > 12) {
              hour -= 12;
              base = 'PM';
            }

            return `→ ${hour}:${minutes.toString().padStart(2, '0')} ${base} - [${title}](${url})`;
          })
          .join('\n')}`,
        (embed) => {
          embed.setTitle(`Shows Airing on ${toTitleCase(day.toLowerCase())} (UTC)`);
        }
      );
    }

    return message.embed(
      '[UTC Timezone Difference](https://www.timeanddate.com/time/difference/timezone/utc)',
      (embed) => {
        embed.setTitle(`Shows Airing This Week (UTC)`).addFields(
          days.map((day) => {
            const daySchedule = schedule[day.toLowerCase() as typeof days[number]];
            return {
              name: `❯ ${toTitleCase(day)}`,
              value: `${daySchedule
                .slice(0, 2)
                .map(({ title, url, airing_start }) => {
                  const date = new Date(airing_start);
                  const minutes = date.getUTCMinutes();
                  let hour = date.getUTCHours();
                  let base = 'AM';

                  if (hour > 12) {
                    hour -= 12;
                    base = 'PM';
                  }

                  return `→ ${hour}:${minutes
                    .toString()
                    .padStart(2, '0')} ${base} - [${title}](${url})`;
                })
                .join('\n')}`,
            };
          })
        );
      }
    );
  }
}
