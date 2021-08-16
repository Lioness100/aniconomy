import type { EventOptions, Events, Piece, Store } from '@sapphire/framework';
import { Event } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { blue, gray, green, magenta, magentaBright, bold } from 'colorette';
import { readFile } from 'fs/promises';

const store = JSON.parse(await readFile('./data/store.json', { encoding: 'utf-8' }));

@ApplyOptions<EventOptions>({ once: true })
export default class UserEvent extends Event<Events.Ready> {
  public async run() {
    await this.printBanner();
    this.printStoreDebugInformation();

    const { client } = this.context;
    if (!client.eco.shop.list(client.guild.id).length) {
      for (const { item, price } of store) {
        client.eco.shop.addItem(this.context.client.guild.id, { itemName: item, price });
      }
    }
  }

  /**
   * print a colorful banner with the version and name
   */
  private async printBanner() {
    const { version, name }: Record<string, string> = JSON.parse(
      await readFile('./package.json', { encoding: 'utf-8' })
    );

    const success = green('+');

    const llc = magentaBright;
    const blc = magenta;
    const line = llc('');
    const pad = ' '.repeat(7);

    this.context.logger.info(
      String.raw`
${line} ${pad}
${line} ${pad}${blc(version)}
${line} ${pad}[${success}] Gateway
${line} ${pad}${blc('<')}${llc('/')}${blc('>')} ${bold(name)}
${line} ${pad}
		`.trim()
    );
  }

  /**
   * print how many pieces are in each store colorfully
   */
  private printStoreDebugInformation() {
    const { client, logger } = this.context;
    const stores = [...client.stores.values()];
    const last = stores.pop()!;

    for (const store of stores) {
      logger.info(this.styleStore(store, false));
    }
    logger.info(this.styleStore(last, true));
  }

  /**
   * style how the {@link UserEvent#printStoreDebugInformation} is displayed
   */
  private styleStore(store: Store<Piece>, last: boolean) {
    return gray(
      `${last ? '└─' : '├─'} Loaded ${blue(store.size.toString().padEnd(3, ' '))} ${store.name}`
    );
  }
}
