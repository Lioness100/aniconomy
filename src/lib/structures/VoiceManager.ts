import type { UserData } from 'discord-voice';
import type { Snowflake } from 'discord.js';
import type Client from '#structures/Client';
import DiscordVoice from 'discord-voice';
import Levels from '#entities/Levels';

export const cDefault = {
  default: { levelingTrackingEnabled: false, voiceTimeToAdd: () => 5000 },
};

export class CustomVoiceManager extends DiscordVoice.VoiceManager {
  public async getAllUsers() {
    const users = await Levels.find({}).select(['voiceTime', 'channels']).lean();
    return users.map(({ _id, voiceTime, channels }) => ({
      userId: _id,
      guildId: (this.client as Client).guild.id,
      data: { voiceTime: { total: voiceTime, channels }, levelingData: { xp: 0, level: 0 } },
    }));
  }

  public async saveUser(
    userId: Snowflake,
    _guildId: never,
    userData: { data: UserData }
  ): Promise<boolean> {
    await Levels.create({
      _id: userId,
      voiceTime: userData.data.voiceTime.total,
      channels: userData.data.voiceTime.channels,
    });
    return true;
  }

  public async editUser(
    userId: Snowflake,
    _guildId: never,
    userData: { data: UserData }
  ): Promise<boolean> {
    // @ts-ignore I hate everuthing
    await Levels.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          voiceTime: userData.data.voiceTime.total,
          channels: userData.data.voiceTime.channels,
        },
      }
    );

    return true;
  }

  public getAllConfigs() {
    return [{ guildId: (this.client as Client).guild.id, data: { default: cDefault } }];
  }

  public saveConfig() {
    return true;
  }
}
