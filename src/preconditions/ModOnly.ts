import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class UserPrecondition extends Precondition {
  public run(message: Message) {
    return message.member!.hasPermission('MANAGE_MESSAGES')
      ? this.ok()
      : this.error({ message: 'You need the `Manage Messages` permission to use this command' });
  }
}
