import { Configuration, OpenAIApi } from 'openai';

export default class OpenAiAdapter {
  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async generateLyrics(prompt) {
    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI GPT-4 error: ${error.message}`);
    }
  }
}
