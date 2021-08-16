declare module 'discord-blackjack' {
  import type { Client, Message } from 'discord.js';
  export default function blackjack(
    message: Message,
    client: Client,
    options: { resultEmbed?: false }
  ): Promise<{
    result: 'Tie' | 'Win' | 'Lose' | 'Double Lose' | 'Double Win' | 'ERROR' | 'Cancel' | 'Timeout';
    ycontent: string;
    yvalue: string;
    dcontent: string;
    dvalue: string;
  }>;
}
