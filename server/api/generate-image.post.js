import OpenAiAdapter from "../interfaces/openAi";

export default defineEventHandler(async (event) => {
  const { song, artist, album } = await readBody(event);

  // Initialize the OpenAiAdapter
  const openAi = new OpenAiAdapter();

  const image = await openAi.generateImage(song, artist, album);

  return { 'image': image };
});
