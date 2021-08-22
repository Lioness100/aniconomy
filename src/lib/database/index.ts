import { Store } from '@sapphire/framework';
import { blueBright, bold } from 'colorette';
import mongoose from 'mongoose';

const mongoConnect = () => {
  const { logger } = Store.injectedContext;

  const connect = () => {
    mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      })
      .then(() => logger.info(blueBright(`${bold('[Database]')} Successfully connected.`)))
      .catch((error) => {
        logger.fatal(error);
        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on('disconnected', connect);
};

export default mongoConnect;
