import type { CustomVoiceManager } from '#structures/VoiceManager';
import { SapphireClient } from '@sapphire/framework';
import { init } from '@androz2091/discord-invites-tracker';
import Economy from 'discord-economy-super';
import DiscordGiveaways from 'discord-giveaways';
import options from '#root/config';

const ecoOptions: Partial<Economy['options']> = {
  checkStorage: false,
  dailyAmount: 500,
  updater: { checkUpdates: false, upToDateMessage: false },
  dateLocale: 'en',
};

Object.defineProperty(ecoOptions, 'workAmount', {
  get: () => Math.ceil(Math.random() * (200 - 100) + 100),
});

export default class Client extends SapphireClient {
  public eco = new (Economy as new (options: unknown) => Economy)(ecoOptions);
  public giveaways: DiscordGiveaways.GiveawaysManager;
  public voiceTime!: CustomVoiceManager;
  public invites: ReturnType<typeof init>;

  public constructor() {
    super(options);

    this.invites = init(this, { fetchAuditLogs: true, fetchGuilds: true, fetchVanity: true });
    this.giveaways = new DiscordGiveaways.GiveawaysManager(this, { updateCountdownEvery: 10000 });
  }

  /* one guild functionality */
  public get guild() {
    return this.guilds.cache.first()!;
  }
}
