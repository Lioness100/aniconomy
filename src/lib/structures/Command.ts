import type {
  ArgType,
  CommandOptions as BaseCommandOptions,
  PieceContext,
  PreconditionEntryResolvable,
} from '@sapphire/framework';
import { Command as BaseCommand, PermissionsPrecondition } from '@sapphire/framework';
import { toTitleCase } from '@sapphire/utilities';
import type { PermissionString } from 'discord.js';
import { sep } from 'path';
import { Preconditions } from '#types/Enums';

export abstract class Command extends BaseCommand {
  /**
   * the category of the command (generated by file location)
   */
  public category: string;

  /**
   * the usage (will be appended by `${prefix}${command.name} ` in context)
   */
  public usage?: string;

  /**
   * the number of ms to force between command executions per user
   */
  public cooldown?: number;

  public constructor(context: PieceContext, options: CommandOptions) {
    super(context, Command.resolvePreconditions(options));
    this.usage = options.usage;
    this.cooldown = options.cooldown;
    this.category = toTitleCase(this.path.split(sep).reverse()[1]);
  }

  /**
   * handle errors when args are not provided/valid
   * @param getArg - should be the result returned from args.method()
   * @param message - personalized error message
   * @example await handleArgs(args.pick('string'), 'Please provide a valid string argument');
   */
  protected handleArgs<T extends ArgType[keyof ArgType]>(
    getArg: Promise<T>,
    message: string
  ): Promise<T> {
    return getArg.catch(() => {
      throw message;
    });
  }

  /**
   * add default preconditions and resolve precondition shorthands
   * ({@link CommandOptions#cooldown}, {@link CommandOptions#permissions})
   */
  public static resolvePreconditions(options: CommandOptions) {
    options.generateDashLessAliases = options.generateDashLessAliases ?? true;
    options.preconditions = options.preconditions || [];

    const preconditions = options.preconditions as PreconditionEntryResolvable[];

    if (options.permissions) {
      preconditions.push(new PermissionsPrecondition(options.permissions));
    }

    if (options.cooldown) {
      preconditions.push({
        name: Preconditions.Cooldown,
        context: { delay: options.cooldown },
      });
    }

    return options;
  }
}

export interface CommandOptions extends BaseCommandOptions {
  usage?: string;
  cooldown?: number;
  permissions?: PermissionString[];
}