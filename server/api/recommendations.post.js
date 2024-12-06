// recommendations.post.js

import OpenAiAdapter from "../interfaces/openAi";

export default defineEventHandler(async (event) => {
  // Read currentSong, artist, and album from the request body
  const { currentSong, artist, album } = await readBody(event);

  console.log(currentSong);
  console.log(artist);
  console.log(album);

  // Ensure all parameters are provided
  if (!currentSong || !artist || !album) {
    throw createError({
      statusCode: 400,
      message: "Invalid parameters provided",
    });
  }

  // Initialize the OpenAiAdapter
  const openAi = new OpenAiAdapter();

  try {
    const recommendations = await openAi.getRecommendations(
      currentSong,
      artist,
      album,
    );
    return { recommendations };
  } catch (error) {
    console.error("Error during OpenAI API call:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to get recommendations",
    });
  }
});
