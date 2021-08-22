<div align="center">

[![Dependencies Status](https://img.shields.io/david/Lioness100/aniconomy?style=for-the-badge)](https://david-dm.org/Lioness100/aniconomy) [![Open Issues](https://img.shields.io/github/issues-raw/Lioness100/aniconomy?style=for-the-badge)](https://github.com/Lioness100/aniconomy/issues) [![Open Pull Requests](https://img.shields.io/github/issues-pr-raw/Lioness100/aniconomy?style=for-the-badge)](https://github.com/Lioness100/aniconomy/pulls) ![Repo Size](https://img.shields.io/github/repo-size/Lioness100/aniconomy?style=for-the-badge) ![Version](https://img.shields.io/github/package-json/v/Lioness100/aniconomy?style=for-the-badge) ![License](https://img.shields.io/github/license/Lioness100/aniconomy?style=for-the-badge)

</div>

Bot made for Fiverr user chrisoliverii30

The first step of setting up this bot is by downloading [Node.js v16](https://nodejs.org/en/download/). If using a VPS, you'll be able to call the following code in the terminal is most SSH environments:

```sh
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt -y install nodejs
```

Next, create your bot. You will need to create a bot application in the [developers space](https://discordapp.com/developers/applications/me). Make sure to create the bot *user* in the "Bot" tab! There, you can fill in the bot's username, profile picture, and description, as well as get values like the client ID and token.

Then, download and unzip the bot's code [here](https://github.com/Lioness100/aniconomy/archive/main.zip).

To configure your bot, you'll need to rename [`.env.example`](./.env.example) to `.env` and fill in the the values. Sign up for the free tier of [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) to get your `MONGO_URI`.

To invite your bot, navigate to the "OAuth2" tab in the application page. In the "scopes" section, select `bot`. In the "bot permission" section, select `ADMINISTRATOR`. This will account for all permissions needed. Copy and paste the generated invite link!

To run the bot on a VPS, you'll need to transfer the folder you downloaded locally to your private environment using something like [FileZilla](https://filezilla-project.org/). The hosting provider you choose should have a tutorial for this.

Locally, you'll need to open Command Prompt on Windows, or the Terminal on Linux or Mac. Use the command `cd path` to navigate to the bot's folder. For example: `cd C:\Users\xxx\OneDrive\Desktop\name`

Now, for both VPS and local, you'll need to run `yarn`, wait a few seconds, and then run `yarn setup`. **The bot is now operational ! 🎉**

**TIP**: You can set role rewards for levels in [`data/level-roles.json`](./data/level-roles.json)
