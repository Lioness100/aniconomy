declare module 'mal-scraper' {
  interface Anime {
    title: string;
    picture: string;
    type?: string;
    status?: string;
    score?: string;
    episodes?: string;
    source?: string;
    favorites?: string;
    ranked?: string;
    trailer?: string;
    rating?: string;
    synopsis?: string;
    englishTitle?: string;
    genres?: string[];
    url: string;
  }
  export function getInfoFromName(query: string): Promise<Anime>;
}
