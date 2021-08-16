import '#env';
import '#ext';
import '@skyra/editable-commands';
import { yellow, green, bold } from 'colorette';
import mongoConnect from '#lib/database/index';
import Client from '#structures/Client';

const client = new Client();
mongoConnect();

try {
  client.logger.info(yellow('Logging in'));
  await client.login(process.env.TOKEN);
  client.logger.info(bold(green('Logged in')));
} catch (error) {
  client.logger.fatal(error);
  client.destroy();
  process.exit(1);
}
