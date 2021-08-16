import type { ArgType } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import type DiscordGiveaways from 'discord-giveaways';
import type Economy from 'discord-economy-super';

declare module '@sapphire/framework' {
  class Command {
    public category: string;
    public usage?: string;
    public cooldown?: number;

    protected handleArgs<T extends ArgType[keyof ArgType]>(
      getArg: Promise<T>,
      message: string
    ): Promise<T>;
  }

  interface ArgType {
    duration: number;
  }

  interface SapphireClient {
    eco: Economy;
    giveaways: DiscordGiveaways.GiveawaysManager;
    guild: Guild;
  }
}
