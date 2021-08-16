import type { CommandDeniedPayload, Events, UserError } from '@sapphire/framework';
import { Event } from '@sapphire/framework';
import ms from 'ms';

export class UserEvent extends Event<Events.CommandDenied> {
  public run(error: UserError, { message }: CommandDeniedPayload) {
    if (Reflect.get(Object(error.context), 'silent')) {
      return;
    }

    const remaining: number = Reflect.get(Object(error.context), 'remaining');
    if (remaining) {
      return message.error(`You're on cooldown! Please try again in \`${ms(remaining)}\`.`);
    }

    return message.error(error.message);
  }
}
