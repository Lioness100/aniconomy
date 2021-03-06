import type { SapphireClientOptions } from '@sapphire/framework';
import type { ClientOptions } from 'discord.js';
import { LogLevel } from '@sapphire/framework';
import { Intents } from 'discord.js';

const prefix = process.env.PREFIX;
const name = process.env.PRESENCE_NAME;
const type = process.env.PRESENCE_TYPE;

const options: SapphireClientOptions & ClientOptions = {
  caseInsensitiveCommands: true,
  caseInsensitivePrefixes: true,
  fetchPrefix: (message) => (message.guild ? prefix : [prefix, '']),
  loadDefaultErrorEvents: false,
  logger: {
    level: LogLevel.Trace,
  },
  messageCacheMaxSize: 25,
  ws: {
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILD_VOICE_STATES,
    ],
  },
};

if (name && type) {
  options.presence = { activity: { name, type } };
}

export default options;
