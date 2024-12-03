import OpenAiAdapter from '../interfaces/openAi';

export default defineEventHandler(async (event) => {
  const openAi = new OpenAiAdapter();
  const { prompt } = await readBody(event);
  return await openAi.generateLyrics(prompt);
});
