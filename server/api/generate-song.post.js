import ReplicateAdapter from "../interfaces/replicate";
import OpenAiAdapter from "../interfaces/openAi";

export default defineEventHandler(async (event) => {
  const { songName, artist, lyrics } = await readBody(event);

  // Initialize the OpenAiAdapter
  const replicate = new ReplicateAdapter();
  const openAi = new OpenAiAdapter();

  const prompt = await openAi.generateMusicPrompt(songName, artist, lyrics);
  const songBuffer = await replicate.generateSong(prompt);

  // Convert the Buffer to Base64
  const songBase64 = songBuffer.toString('base64');

  return { 'song': songBase64 };
});
