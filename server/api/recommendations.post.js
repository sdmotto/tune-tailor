// recommendations.post.js

import OpenAiAdapter from "../interfaces/openAi";

export default defineEventHandler(async (event) => {
  // Read currentSong, artist, and album from the request body
  const { currentSong, artist, albumTitle, genre } = await readBody(event);

  // Initialize the OpenAiAdapter
  const openAi = new OpenAiAdapter();

  const recommendations = await openAi.getRecommendations(
    currentSong,
    artist,
    albumTitle,
    genre
  );
  return { recommendations };
});
