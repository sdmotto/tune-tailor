import OpenAI from 'openai';

export default class OpenAiAdapter {
  constructor() {
    this.openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
  }

  async generateLyrics(prompt) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI GPT-4 error: ${error.message}`);
    }
  }


  async getRecommendations(currentSong, artist, album) {
    const prompt = `I just listened to "${currentSong}" by ${artist} from the album "${album}". Can you recommend similar songs that I might like? Please provide a list of 5 songs with their titles and artists.`;
    try {
      const response = await this.openai.chat.completions({
        model: 'gpt-4o',
        prompt: prompt,
        max_tokens: 150,
        n: 1,
        stop: null,
        temperature: 0.7,
      });
      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error('Error during OpenAI API call:', error);
      throw error;
    }
  }

}
