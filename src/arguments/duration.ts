import { Argument } from '@sapphire/framework';
import ms from 'ms';

export default class UserArgument extends Argument<number> {
  public run(parameter: string) {
    const parsed = ms(parameter);
    return parsed ? this.ok(parsed) : this.error({ parameter });
  }
}
