import type { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { getModelForClass, modelOptions, prop, Severity } from '@typegoose/typegoose';
import { readFile } from 'fs/promises';
import type Client from '#structures/Client';
import Entity from '#entities/Entity';

interface Reward {
  level: number;
  role: string;
}

const rewards: Reward[] = JSON.parse(
  await readFile('./data/level-roles.json', { encoding: 'utf-8' })
);

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class Levels extends Entity {
  @prop({ default: 0 })
  public xp!: number;

  @prop({ default: 0 })
  public level!: number;

  @prop({ default: 0 })
  public voiceTime!: number;

  @prop({ default: [] })
  public channels!: unknown[];

  @prop({ default: 0 })
  public messages!: number;

  /**
   * adds xp to a user
   * @returns whether the user leveled up
   */
  public async addXp(client: Client, xp: number) {
    this.xp += xp;
    this.level = Levels.levelFor(this.xp);

    const hasLeveledUp = Levels.levelFor(this.xp - xp) < this.level;
    if (hasLeveledUp) {
      const reward = rewards.findIndex((reward) => reward.level === this.level);
      if (reward >= 0) {
        const lastRole = client.guild.roles.cache.get(rewards[reward - 1]?.role);
        const nextRole = client.guild.roles.cache.get(rewards[reward]?.role);
        const member = client.guild.members.cache.get(this._id);

        if (member) {
          if (lastRole && member.roles.cache.has(lastRole.id)) {
            await member.roles.remove(lastRole);
          }

          if (nextRole) {
            await member.roles.add(nextRole);
          }
        }
      }
    }

    return hasLeveledUp;
  }

  public static computeLeaderboard(this: ReturnModelType<typeof Levels>, limit: number) {
    return this.find({ xp: { $gt: 0 } })
      .limit(limit)
      .sort([['xp', 'descending']])
      .lean();
  }

  /**
   * calculates level from xp
   */
  public static levelFor(xp: number) {
    return Math.floor(0.1 * Math.sqrt(xp));
  }

  /**
   * calculates xp from level
   */
  public static xpFor(level: number) {
    return level ** 2 * 100;
  }

  /**
   * extends {@link Entity.ensure} but returns a LevelsDocument type
   */
  public static ensure(_id: string): Promise<LevelsDocument> {
    return Entity.ensure.call(this, _id);
  }
}

export type LevelsDocument = DocumentType<Levels>;
export default getModelForClass(Levels);
