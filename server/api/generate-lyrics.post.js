import OpenAiAdapter from "../interfaces/openAi";

export default defineEventHandler(async (event) => {
  const { song, artist } = await readBody(event);

  // Initialize the OpenAiAdapter
  const openAi = new OpenAiAdapter();

  const newSong = await openAi.generateLyrics(song, artist);

  return { 'song': newSong };
});
