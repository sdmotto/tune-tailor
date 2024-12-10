import OpenAI from "openai";
import axios from "axios";

export default class OpenAiAdapter {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateLyrics(song, artist) {
    const prompt = `
    Using the song "${song}" by ${artist} as inspiration, write the lyrics for a brand new song. 
    The new song should:
    - Maintain a similar theme or emotional tone as "${song}".
    - Use creative and original lyrics that are not directly copied from the original song.
    - Include a title for the new song.
    - Provide the lyrics formatted in this EXACT format:
    [title]
    title

    [verse]
    verse

    [chorus]
    chorus

    etc

    Avoid any copyright infringement by ensuring the lyrics are entirely original.
    Ensure that the song is complete. That means if you start a tag like [chorus], make sure to complete it entirely.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      throw new Error(`OpenAI GPT-4 error: ${error.message}`);
    }
  }

  async getRecommendations(currentSong, artist, album, genre) {
    const prompt = `
    I just listened to "${currentSong}" by ${artist} from the album "${album} in genre "${genre}".
    Can you recommend similar songs that I might like? 
    Please provide a list of EXACTLY 5 songs with their titles and artists.
    Format your response in this EXACT format:
    [
      {
        "song": "song1",
        "artist": "artist1"
      },
      {
        "song": "song2",
        "artist": "artist2"
      },
      etc.
    ]
    Give varied recommendations, and DO NOT use any single artist more than twice.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      });

      const responseText = response.choices[0].message.content.trim();

      const recommendations = JSON.parse(responseText);

      return recommendations;
    } catch (error) {
      console.error("Error during OpenAI API call:", error);
      throw error;
    }
  }

  async generateImage(song, artist, album) {

    try {
      const response = await this.openai.images.generate({
        prompt: `Please make an image based on this song ${song} by ${artist} from album ${album}. Image only without typography`,
        model: 'dall-e-3',
        n: 1,
        size: '1024x1024',
      });
  
      const imageUrl = response.data[0].url;
  
      return imageUrl
    } catch (error) {
      throw new Error(`OpenAI DALL-E error: ${error.message}`);
    }
  }
}
